import { defineStore } from 'pinia'
import api from '@/services/api'

export const useItemStore = defineStore('item', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchItems() {
      this.loading = true
      try {
        this.items = await api.getItems()
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async addItem(item) {
      try {
        const newItem = await api.createItem(item)
        this.items.push(newItem)
        return newItem
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    async updateItem(id, item) {
      try {
        const updatedItem = await api.updateItem(id, item)
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) this.items[index] = updatedItem
        return updatedItem
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    async deleteItem(id) {
      try {
        await api.deleteItem(id)
        this.items = this.items.filter(i => i.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})