import api from "../api";

export const getWarehouses = () => api.get("/warehouses");
export const getWarehouse = (id) => api.get(`/warehouses/${id}`);
export const createWarehouse = (data) => api.post("/warehouses", data);
export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data);
export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`);
export const getLocations = (id) => api.get(`/warehouses/${id}/locations`);
export const createLocation = (id, data) =>
  api.post(`/warehouses/${id}/locations`, data);
