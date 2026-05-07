<template>
    <div class="container">
        <div class="navbar">
            <h1>🔗 URL Shortener</h1>
            <div class="nav-right">
                <span class="balance" @click="showDeposit = true" style="cursor:pointer">
                    💰 {{ userBalance.toLocaleString() }} VND
                </span>
                <span>👤 {{ authInfo.username }}</span>
                <button v-if="authInfo.role === 'admin'" @click="$router.push('/admin')" class="btn-admin">Admin</button>
                <button @click="logout" class="btn-logout">Logout</button>
            </div>
        </div>

        <div class="input-group">
            <input v-model="inputUrl" type="text" placeholder="Paste your long URL here..." @keyup.enter="shorten" />
            <button @click="shorten" :disabled="loading">{{ loading ? '...' : 'Shorten' }}</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <table v-if="urls.length">
            <thead>
                <tr><th>Short URL</th><th>Original</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
                <tr v-for="url in urls" :key="url.id" :class="{ expired: url.isExpired }">
                    <td><a :href="url.shortUrl" target="_blank">{{ url.shortUrl }}</a></td>
                    <td class="truncate"><a :href="url.originalUrl" target="_blank">{{ url.originalUrl }}</a></td>
                    <td>{{ new Date(url.expiresAt).toLocaleDateString() }}</td>
                    <td>
                        <span :class="url.isExpired ? 'badge-red' : 'badge-green'">
                            {{ url.isExpired ? 'Expired' : 'Active' }}
                        </span>
                    </td>
                    <td>
                        <button class="extend-btn" @click="openExtend(url)">⏳ Extend</button>
                        <button class="del-btn" @click="remove(url.id)">🗑</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Deposit Modal -->
        <div v-if="showDeposit" class="modal-overlay" @click.self="showDeposit = false">
            <div class="modal">
                <h3>💰 Deposit</h3>
                <input v-model.number="depositAmount" type="number" placeholder="Amount (VND)" min="1000" step="1000" />
                <div v-if="depositError" class="error">{{ depositError }}</div>
                <div class="modal-actions">
                    <button @click="doDeposit" :disabled="depositLoading">{{ depositLoading ? '...' : 'Deposit' }}</button>
                    <button class="btn-cancel" @click="showDeposit = false">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Extend Modal -->
        <div v-if="showExtend" class="modal-overlay" @click.self="showExtend = false">
            <div class="modal">
                <h3>⏳ Extend Link</h3>
                <p>Cost: <strong>10,000 VND</strong> per 7 days</p>
                <p>Your balance: <strong>{{ userBalance.toLocaleString() }} VND</strong></p>
                <p class="select-label">Select options:</p>
                <div class="extend-grid">
                    <button v-for="opt in extendOptions"
                            :key="opt.days"
                            :class="['extend-option', { selected: extendDays === opt.days }]"
                            @click="extendDays = opt.days">
                        {{ (opt.days / 7 * 10000).toLocaleString() }} VND
                    </button>
                </div>
                <p class="extend-info">+{{ extendDays }} days • Cost: {{ (extendDays / 7 * 10000).toLocaleString() }} VND</p>
                <div v-if="extendError" class="error">{{ extendError }}</div>
                <div class="modal-actions">
                    <button @click="doExtend" :disabled="extendLoading" class="btn-extend-confirm">{{ extendLoading ? '...' : 'Extend' }}</button>
                    <button class="btn-cancel" @click="showExtend = false">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { getAuth, clearAuth, shortenUrl, getAllUrls, deleteUrl, depositApi, extendUrlApi, getBalance } from '../services/api'

    const router = useRouter()
    const authInfo = getAuth()
    const inputUrl = ref('')
    const loading = ref(false)
    const error = ref('')
    const result = ref(null)
    const urls = ref([])
    const userBalance = ref(0)

    // Deposit
    const showDeposit = ref(false)
    const depositAmount = ref(10000)
    const depositError = ref('')
    const depositLoading = ref(false)

    // Extend
    const showExtend = ref(false)
    const extendDays = ref(7)
    const extendError = ref('')
    const extendLoading = ref(false)
    const selectedUrl = ref(null)
    const extendOptions = [
        { days: 7 },
        { days: 14 },
        { days: 35 },
        { days: 70 },
        { days: 140 },
        { days: 350 },
    ]

    async function shorten() {
        if (!inputUrl.value) return
        error.value = ''; result.value = null; loading.value = true
        try {
            const data = await shortenUrl(inputUrl.value)
            if (data.error) error.value = data.error
            else { result.value = data; inputUrl.value = ''; await loadAll() }
        } catch { error.value = 'Cannot connect to server.' }
        loading.value = false
    }

    async function loadAll() {
        urls.value = await getAllUrls()
        const b = await getBalance()
        if (b.balance !== undefined) userBalance.value = b.balance
    }

    async function doDeposit() {
        depositError.value = ''
        depositLoading.value = true
        try {
            const data = await depositApi({ amount: depositAmount.value })
            userBalance.value = data.balance
            showDeposit.value = false
        } catch (e) {
            depositError.value = e?.response?.data?.error || 'Deposit failed.'
        }
        depositLoading.value = false
    }

    function openExtend(url) {
        selectedUrl.value = url
        extendDays.value = 7
        extendError.value = ''
        showExtend.value = true
    }

    async function doExtend() {
        extendError.value = ''
        extendLoading.value = true
        try {
            const data = await extendUrlApi(selectedUrl.value.id, { days: extendDays.value })
            userBalance.value = data.balance
            await loadAll()
            showExtend.value = false
        } catch (e) {
            extendError.value = e?.response?.data?.error || 'Extend failed.'
        }
        extendLoading.value = false
    }

    async function remove(id) {
        if (!confirm('Delete this URL?')) return
        await deleteUrl(id); await loadAll()
    }

    function copy(text) { navigator.clipboard.writeText(text); alert('Copied!') }
    function logout() { clearAuth(); router.push('/login') }

    onMounted(loadAll)
</script>

<style scoped>
    .container {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
        font-family: sans-serif;
    }

    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .nav-right {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .balance {
        font-weight: bold;
        color: #047857;
        background: #f0fdf4;
        padding: 4px 12px;
        border-radius: 999px;
    }

    h1 {
        margin: 0;
    }

    .input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }

    input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
    }

    button {
        padding: 10px 18px;
        background: #4f46e5;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

        button:disabled {
            background: #aaa;
        }

    .btn-admin {
        background: #0891b2;
        padding: 8px 14px;
    }

    .btn-logout {
        background: #6b7280;
        padding: 8px 14px;
    }

    .btn-cancel {
        background: #6b7280;
    }

    .error {
        color: red;
        margin-bottom: 10px;
    }

    .result {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f0fdf4;
        border-radius: 6px;
        margin-bottom: 20px;
    }

        .result button {
            background: #16a34a;
            padding: 6px 12px;
            font-size: 0.85rem;
        }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    th, td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.9rem;
        text-align: left;
    }

    th {
        background: #f9fafb;
    }

    .truncate {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .del-btn {
        background: #ef4444;
        padding: 6px 10px;
        font-size: 0.85rem;
        margin-left: 6px;
    }

    .extend-btn {
        background: #f59e0b;
        padding: 6px 10px;
        font-size: 0.85rem;
    }

    .expired {
        opacity: 0.5;
    }

    .badge-green {
        background: #dcfce7;
        color: #16a34a;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.8rem;
    }

    .badge-red {
        background: #fee2e2;
        color: #dc2626;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.8rem;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .modal {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        min-width: 320px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

        .modal h3 {
            margin: 0;
        }

        .modal input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 1rem;
        }

    .modal-actions {
        display: flex;
        gap: 10px;
    }

    .extend-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .extend-option {
        background: #fff;
        color: #111;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 10px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.15s;
    }

        .extend-option:hover {
            background: #f3f4f6;
        }

        .extend-option.selected {
            background: #f59e0b;
            color: #fff;
            border-color: #f59e0b;
        }

    .extend-info {
        font-size: 0.9rem;
        color: #6b7280;
        margin: 0;
    }

    .select-label {
        margin: 0;
        font-size: 0.9rem;
        color: #374151;
    }

    .btn-extend-confirm {
        background: #f59e0b;
    }

</style>