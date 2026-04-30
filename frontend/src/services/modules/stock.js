import api from "../api";

export const getStock = (params) => api.get("/stock", { params });
export const checkStock = (params) => api.get("/stock/check", { params });
export const mutateStock = (data) => api.post("/stock/mutate", data);
export const getStockHistory = (params) =>
  api.get("/stock/history", { params });
