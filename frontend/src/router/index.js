import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/auth/LoginPage.vue"),
    meta: { guest: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/pages/dashboard/DashboardPage.vue"),
      },
      {
        path: "products",
        name: "Products",
        component: () => import("@/pages/products/ProductsPage.vue"),
      },
      {
        path: "warehouses",
        name: "Warehouses",
        component: () => import("@/pages/warehouses/WarehousesPage.vue"),
      },
      {
        path: "stock",
        name: "Stock",
        component: () => import("@/pages/stock/StockPage.vue"),
      },
      {
        path: "purchase-orders",
        name: "PurchaseOrders",
        component: () =>
          import("@/pages/purchase-orders/PurchaseOrdersPage.vue"),
      },
      {
        path: "sales-orders",
        name: "SalesOrders",
        component: () => import("@/pages/sales-orders/SalesOrdersPage.vue"),
      },
      {
        path: "reports",
        name: "Reports",
        component: () => import("@/pages/reports/ReportsPage.vue"),
      },
      {
        path: "suppliers",
        name: "Suppliers",
        component: () => import("@/pages/suppliers/SuppliersPage.vue"),
      },
      {
        path: "users",
        name: "Users",
        component: () => import("@/pages/users/UsersPage.vue"),
      }
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next("/login");
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return next("/");
  }

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchMe();
  }

  next();
});

export default router;
