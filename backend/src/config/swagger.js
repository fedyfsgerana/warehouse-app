const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Warehouse Management API",
    version: "1.0.0",
    description:
      "API Documentation untuk Inventory & Warehouse Management System",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "admin@warehouse.com" },
                  password: { type: "string", example: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login berhasil" },
          401: { description: "Email atau password salah" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Data user berhasil diambil" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logout berhasil" },
        },
      },
    },
    "/api/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Ganti password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  oldPassword: { type: "string" },
                  newPassword: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password berhasil diubah" },
          401: { description: "Password lama salah" },
        },
      },
    },
  },
};

module.exports = { swaggerUi, swaggerDocument };
