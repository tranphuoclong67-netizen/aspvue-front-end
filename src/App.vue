<template>
  <div id="app">
    <header>
      <h1>Vue Frontend with Backend API</h1>
    </header>
    
    <main>
      <div class="container">
        <div class="add-item-form">
          <h2>Add New Item</h2>
          <form @submit.prevent="addNewItem">
            <input 
              v-model="newItem.name" 
              placeholder="Item Name" 
              required
            >
            <input 
              v-model="newItem.description" 
              placeholder="Description" 
              required
            >
            <button type="submit">Add Item</button>
          </form>
        </div>
        
        <div class="items-list">
          <h2>Items List</h2>
          <div v-if="store.loading">Loading...</div>
          <div v-else-if="store.error" class="error">
            Error: {{ store.error }}
          </div>
          <div v-else>
            <div 
              v-for="item in store.items" 
              :key="item.id" 
              class="item-card"
            >
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="item-actions">
                <button @click="editItem(item)" class="edit">Edit</button>
                <button @click="deleteItem(item.id)" class="delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Edit Modal -->
        <div v-if="editingItem" class="modal">
          <div class="modal-content">
            <h2>Edit Item</h2>
            <form @submit.prevent="updateItem">
              <input v-model="editingItem.name" required>
              <input v-model="editingItem.description" required>
              <button type="submit">Update</button>
              <button type="button" @click="editingItem = null">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'

const store = useItemStore()
const newItem = ref({ name: '', description: '' })
const editingItem = ref(null)

onMounted(() => {
  store.fetchItems()
})

const addNewItem = async () => {
  await store.addItem({ ...newItem.value })
  newItem.value = { name: '', description: '' }
}

const editItem = (item) => {
  editingItem.value = { ...item }
}

const updateItem = async () => {
  await store.updateItem(editingItem.value.id, editingItem.value)
  editingItem.value = null
}

const deleteItem = async (id) => {
  if (confirm('Are you sure?')) {
    await store.deleteItem(id)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.add-item-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.add-item-form input {
  margin: 10px;
  padding: 10px;
  width: 200px;
}

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background: white;
}

.item-actions button {
  margin: 5px;
  padding: 5px 10px;
}

.edit {
  background: #4CAF50;
  color: white;
}

.delete {
  background: #f44336;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  min-width: 300px;
}

.error {
  color: red;
  text-align: center;
  padding: 20px;
}
</style>