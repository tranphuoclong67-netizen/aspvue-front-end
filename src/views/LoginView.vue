<template>
    <div class="auth-container">
        <h2>Login</h2>
        <input v-model="username" placeholder="Username" />
        <input v-model="password" type="password" placeholder="Password" />
        <div v-if="error" class="error">{{ error }}</div>
        <button @click="submit" :disabled="loading">{{ loading ? '...' : 'Login' }}</button>
        <p>No account? <a href="/register">Register</a></p>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { saveAuth } from '../services/api'

    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    async function submit() {
        error.value = ''
        loading.value = true
        try {
            const res = await fetch('http://localhost:5035/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value, password: password.value })
            })
            const data = await res.json()
            if (data.error) { error.value = data.error; return }
            saveAuth(data.token, data.username, data.role)
            router.push('/')
        } catch {
            error.value = 'Cannot connect to server.'
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    .auth-container {
        max-width: 380px;
        margin: 100px auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-family: sans-serif;
        padding: 0 20px;
    }

    h2 {
        margin-bottom: 8px;
    }

    input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
    }

    button {
        padding: 10px;
        background: #4f46e5;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
    }

    .error {
        color: red;
        font-size: 0.9rem;
    }
</style>