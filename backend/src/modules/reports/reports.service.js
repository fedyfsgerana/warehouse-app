const pool = require("../../config/db");

const getDashboard = async () => {
  const totalProducts = await pool.query("SELECT COUNT(*) FROM products");
  const totalWarehouses = await pool.query("SELECT COUNT(*) FROM warehouses");
  const totalPO = await pool.query("SELECT COUNT(*) FROM purchase_orders");
  const totalSO = await pool.query("SELECT COUNT(*) FROM sales_orders");

  const lowStock = await pool.query(`
    SELECT p.name, p.sku, p.min_stock, SUM(sl.qty) AS total_qty
    FROM products p
    LEFT JOIN stock_locations sl ON p.id = sl.product_id
    GROUP BY p.id
    HAVING SUM(sl.qty) <= p.min_stock
    ORDER BY total_qty ASC
  `);

  const recentTransactions = await pool.query(`
    SELECT st.*, p.name AS product_name, u.name AS created_by_name
    FROM stock_transactions st
    JOIN products p ON st.product_id = p.id
    JOIN users u ON st.created_by = u.id
    ORDER BY st.created_at DESC
    LIMIT 10
  `);

  return {
    summary: {
      total_products: parseInt(totalProducts.rows[0].count),
      total_warehouses: parseInt(totalWarehouses.rows[0].count),
      total_po: parseInt(totalPO.rows[0].count),
      total_so: parseInt(totalSO.rows[0].count),
    },
    low_stock: lowStock.rows,
    recent_transactions: recentTransactions.rows,
  };
};

const getStockMovement = async ({ from, to }) => {
  let query = `
    SELECT st.*, p.name AS product_name, p.sku,
           w.name AS warehouse_name, u.name AS created_by_name
    FROM stock_transactions st
    JOIN products p ON st.product_id = p.id
    JOIN warehouses w ON st.warehouse_id = w.id
    JOIN users u ON st.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (from) {
    params.push(from);
    query += ` AND st.created_at >= $${params.length}`;
  }

  if (to) {
    params.push(to);
    query += ` AND st.created_at <= $${params.length}`;
  }

  query += " ORDER BY st.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

const getPOSummary = async ({ from, to }) => {
  let query = `
    SELECT po.*, s.name AS supplier_name,
           COUNT(poi.id) AS total_items,
           SUM(poi.qty * poi.price) AS total_value
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
    WHERE 1=1
  `;
  const params = [];

  if (from) {
    params.push(from);
    query += ` AND po.created_at >= $${params.length}`;
  }

  if (to) {
    params.push(to);
    query += ` AND po.created_at <= $${params.length}`;
  }

  query += " GROUP BY po.id, s.name ORDER BY po.created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = { getDashboard, getStockMovement, getPOSummary };
