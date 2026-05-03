<template>
    <div class="container">
        <h1>Admin Dashboard</h1>

        <h2>Users</h2>
        <table>
            <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
                <tr v-for="u in users" :key="u.id">
                    <td>{{ u.id }}</td>
                    <td>{{ u.username }}</td>
                    <td>{{ u.role }}</td>
                    <td>
                        <button v-if="u.role !== 'admin'" @click="promote(u.id)" class="btn-green">Set Admin</button>
                        <button v-else @click="demote(u.id)" class="btn-red">Set User</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>All URLs</h2>
        <table>
            <thead><tr><th>Short</th><th>Original</th><th>User</th><th></th></tr></thead>
            <tbody>
                <tr v-for="url in urls" :key="url.id">
                    <td>/r/{{ url.code }}</td>
                    <td class="truncate">{{ url.originalUrl }}</td>
                    <td>{{ url.userId ?? 'guest' }}</td>
                    <td><button class="btn-red" @click="removeUrl(url.id)">🗑</button></td>
                </tr>
            </tbody>
        </table>

        <br>
        <button @click="$router.push('/')">← Back</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminGetAllUsers, adminGetAllUrls, adminDeleteUrl, adminSetRole } from '../services/api'

const users = ref([])
const urls = ref([])

async function load() {
  users.value = await adminGetAllUsers()
  urls.value = await adminGetAllUrls()
}

async function promote(id) { await adminSetRole(id, 'admin'); await load() }
async function demote(id) { await adminSetRole(id, 'user'); await load() }
async function removeUrl(id) {
  if (!confirm('Delete?')) return
  await adminDeleteUrl(id); await load()
}

onMounted(load)
</script>

<style scoped>
    .container {
        max-width: 900px;
        margin: 40px auto;
        padding: 0 20px;
        font-family: sans-serif;
    }

    h1 {
        margin-bottom: 20px;
    }

    h2 {
        margin: 24px 0 12px;
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
    }

    .truncate {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    button {
        padding: 8px 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        color: #fff;
    }

    .btn-green {
        background: #16a34a;
    }

    .btn-red {
        background: #ef4444;
    }
</style>