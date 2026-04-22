<script setup>
import { ref, onMounted } from 'vue'

const message = ref('')

onMounted(async () => {
  try {
    const res = await fetch('https://serverapi-fn93.onrender.com')
    message.value = await res.text()
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div>
    <nav style="margin-bottom: 20px;">
      <router-link to="/" style="margin-right: 10px;">Home</router-link>
      <router-link to="/table">Static Table</router-link>
    </nav>

    <router-view />
  </div>
</template>