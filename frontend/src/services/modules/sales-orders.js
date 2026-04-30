import api from '../api'

export const getSalesOrders = (params) => api.get('/sales-orders', { params })
export const getSalesOrder = (id) => api.get(`/sales-orders/${id}`)
export const createSalesOrder = (data) => api.post('/sales-orders', data)
export const confirmSalesOrder = (id) => api.put(`/sales-orders/${id}/confirm`)
export const shipSalesOrder = (id, data) => api.put(`/sales-orders/${id}/ship`, data)