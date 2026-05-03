<template>
    <div class="auth-container">
        <h2>Register</h2>
        <input v-model="username" placeholder="Username" />
        <input v-model="password" type="password" placeholder="Password" />
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">Registered! <a href="/login">Login now</a></div>
        <button @click="submit" :disabled="loading">{{ loading ? '...' : 'Register' }}</button>
        <p>Have account? <a href="/login">Login</a></p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '../services/api'

const username = ref('')
const password = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

async function submit() {
  error.value = ''
  success.value = false
  loading.value = true
  const data = await register(username.value, password.value)
  loading.value = false
  if (data.error) error.value = data.error
  else success.value = true
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

    .success {
        color: green;
        font-size: 0.9rem;
    }
</style>