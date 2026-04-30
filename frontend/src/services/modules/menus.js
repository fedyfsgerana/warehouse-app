import api from "../api";

export const getMyMenus = () => api.get("/menus/my-menus");
export const getAllMenus = () => api.get("/menus");
export const createMenu = (data) => api.post("/menus", data);
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data);
export const updateMenuOrder = (items) => api.put("/menus/order", { items });
export const deleteMenu = (id) => api.delete(`/menus/${id}`);
