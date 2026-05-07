<template>
    <div class="container">
        <div class="navbar">
            <h1>⚙️ Admin Dashboard</h1>
            <button @click="$router.push('/')" class="btn-back">← Back</button>
        </div>

        <!-- Stats -->
        <div class="stats-grid" v-if="stats">
            <div class="stat-card">
                <div class="stat-num">{{ stats.totalUsers }}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">{{ stats.totalUrls }}</div>
                <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat-card green">
                <div class="stat-num">{{ stats.activeUrls }}</div>
                <div class="stat-label">Active URLs</div>
            </div>
            <div class="stat-card red">
                <div class="stat-num">{{ stats.expiredUrls }}</div>
                <div class="stat-label">Expired URLs</div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button :class="['tab', { active: tab === 'users' }]" @click="tab = 'users'">👥 Users</button>
            <button :class="['tab', { active: tab === 'urls' }]" @click="tab = 'urls'">🔗 URLs</button>
        </div>

        <!-- Users Tab -->
        <div v-if="tab === 'users'">
            <div class="search-bar">
                <input v-model="userSearch" placeholder="Search username..." />
            </div>
            <table>
                <thead>
                    <tr><th>ID</th><th>Username</th><th>Role</th><th>Balance</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <tr v-for="u in filteredUsers" :key="u.id">
                        <td>{{ u.id }}</td>
                        <td>{{ u.username }}</td>
                        <td>
                            <span :class="u.role === 'admin' ? 'badge-purple' : 'badge-gray'">{{ u.role }}</span>
                        </td>
                        <td>{{ u.balance.toLocaleString() }} VND</td>
                        <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                        <td class="actions">
                            <button v-if="u.role !== 'admin'" @click="setRole(u.id, 'admin')" class="btn-promote">Set Admin</button>
                            <button v-else @click="setRole(u.id, 'user')" class="btn-demote">Set User</button>
                            <button @click="deleteUser(u.id)" class="btn-del">🗑</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- URLs Tab -->
        <div v-if="tab === 'urls'">
            <div class="search-bar">
                <input v-model="urlSearch" placeholder="Search URL..." />
            </div>
            <table>
                <thead>
                    <tr><th>Short</th><th>Original</th><th>User</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <tr v-for="url in filteredUrls" :key="url.id" :class="{ expired: url.isExpired }">
                        <td><a :href="url.shortUrl" target="_blank">/r/{{ url.code }}</a></td>
                        <td class="truncate"><a :href="url.originalUrl" target="_blank">{{ url.originalUrl }}</a></td>
                        <td>{{ url.userId ?? 'guest' }}</td>
                        <td>{{ new Date(url.expiresAt).toLocaleDateString() }}</td>
                        <td>
                            <span :class="url.isExpired ? 'badge-red' : 'badge-green'">
                                {{ url.isExpired ? 'Expired' : 'Active' }}
                            </span>
                        </td>
                        <td><button @click="deleteUrl(url.id)" class="btn-del">🗑</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { adminGetAllUsers, adminGetAllUrls, adminDeleteUrl, adminSetRole, adminDeleteUser, adminGetStats } from '../services/api'

    const tab = ref('users')
    const users = ref([])
    const urls = ref([])
    const stats = ref(null)
    const userSearch = ref('')
    const urlSearch = ref('')

    const filteredUsers = computed(() =>
        users.value.filter(u => u.username.toLowerCase().includes(userSearch.value.toLowerCase()))
    )

    const filteredUrls = computed(() =>
        urls.value.filter(u => u.originalUrl.toLowerCase().includes(urlSearch.value.toLowerCase()) ||
            u.code.toLowerCase().includes(urlSearch.value.toLowerCase()))
    )

    async function load() {
        users.value = await adminGetAllUsers()
        urls.value = await adminGetAllUrls()
        stats.value = await adminGetStats()
    }

    async function setRole(id, role) {
        await adminSetRole(id, role)
        await load()
    }

    async function deleteUser(id) {
        if (!confirm('Delete this user and all their URLs?')) return
        await adminDeleteUser(id)
        await load()
    }

    async function deleteUrl(id) {
        if (!confirm('Delete this URL?')) return
        await adminDeleteUrl(id)
        await load()
    }

    onMounted(load)
</script>

<style scoped>
    .container {
        max-width: 1000px;
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

    h1 {
        margin: 0;
    }

    .btn-back {
        background: #6b7280;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }

    .stat-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
    }

        .stat-card.green {
            background: #f0fdf4;
            border-color: #86efac;
        }

        .stat-card.red {
            background: #fef2f2;
            border-color: #fca5a5;
        }

    .stat-num {
        font-size: 2rem;
        font-weight: 700;
    }

    .stat-label {
        font-size: 0.85rem;
        color: #6b7280;
        margin-top: 4px;
    }

    .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    .tab {
        padding: 8px 20px;
        border: 1px solid #d1d5db;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.95rem;
    }

        .tab.active {
            background: #4f46e5;
            color: #fff;
            border-color: #4f46e5;
        }

    .search-bar {
        margin-bottom: 12px;
    }

        .search-bar input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 0.95rem;
            box-sizing: border-box;
        }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.9rem;
        text-align: left;
    }

    th {
        background: #f9fafb;
        font-weight: 600;
    }

    .truncate {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .actions {
        display: flex;
        gap: 6px;
    }

    .btn-promote {
        background: #7c3aed;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .btn-demote {
        background: #f59e0b;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .btn-del {
        background: #ef4444;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .badge-purple {
        background: #ede9fe;
        color: #7c3aed;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.8rem;
    }

    .badge-gray {
        background: #f3f4f6;
        color: #374151;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.8rem;
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

    .expired {
        opacity: 0.5;
    }
</style>