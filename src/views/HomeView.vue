<template>
    <div class="container">
        <div class="navbar">
            <h1>🔗 URL Shortener</h1>
            <div class="nav-right">
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

        <div v-if="result" class="result">
            <a :href="result.shortUrl" target="_blank">{{ result.shortUrl }}</a>
            <button @click="copy(result.shortUrl)">Copy</button>
        </div>

        <table v-if="urls.length">
            <thead><tr><th>Short</th><th>Original</th><th>Date</th><th></th></tr></thead>
            <tbody>
                <tr v-for="url in urls" :key="url.id">
                    <td><a :href="url.shortUrl" target="_blank">/r/{{ url.code }}</a></td>
                    <td class="truncate">{{ url.originalUrl }}</td>
                    <td>{{ new Date(url.createdAt).toLocaleDateString() }}</td>
                    <td><button class="del-btn" @click="remove(url.id)">🗑</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { getAuth, clearAuth, shortenUrl, getAllUrls, deleteUrl } from '../services/api'

    const router = useRouter()
    const authInfo = getAuth()
    const inputUrl = ref('')
    const loading = ref(false)
    const error = ref('')
    const result = ref(null)
    const urls = ref([])

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

    async function remove(id) {
        if (!confirm('Delete this URL?')) return
        await deleteUrl(id); await loadAll()
    }

    async function loadAll() { urls.value = await getAllUrls() }
    function copy(text) { navigator.clipboard.writeText(text); alert('Copied!') }
    function logout() { clearAuth(); router.push('/login') }

    onMounted(loadAll)
</script>

<style scoped>
    .container {
        max-width: 700px;
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
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .del-btn {
        background: #ef4444;
        padding: 6px 10px;
        font-size: 0.85rem;
    }
</style>