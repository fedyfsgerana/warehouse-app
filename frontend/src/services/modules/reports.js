import api from "../api";

export const getDashboard = () => api.get("/reports/dashboard");
export const getStockMovement = (params) =>
  api.get("/reports/stock-movement", { params });
export const getPOSummary = (params) =>
  api.get("/reports/po-summary", { params });
