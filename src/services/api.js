import axios from 'axios'

const API_URL = '/api'

export default {
  async getItems() {
    const response = await axios.get(`${API_URL}/items`)
    return response.data
  },
  
  async getItem(id) {
    const response = await axios.get(`${API_URL}/items/${id}`)
    return response.data
  },
  
  async createItem(item) {
    const response = await axios.post(`${API_URL}/items`, item)
    return response.data
  },
  
  async updateItem(id, item) {
    const response = await axios.put(`${API_URL}/items/${id}`, item)
    return response.data
  },
  
  async deleteItem(id) {
    await axios.delete(`${API_URL}/items/${id}`)
  }
}