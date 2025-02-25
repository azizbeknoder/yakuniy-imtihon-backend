import { pool } from "../../common/database/dbConnect.service.js";

export async function ordersAdd(req, res) {
  try {
    const { total_price, order_items } = req.body;

    // Buyurtmani qo'shish
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *`,
      [req.user.id, total_price]
    );

    const orderId = orderResult.rows[0].id;

    // Buyurtma mahsulotlarini qo'shish
    const orderItemsValues = order_items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
    ]);

    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price) 
      VALUES ${orderItemsValues
        .map(
          (_, i) =>
            `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
        )
        .join(", ")}
      RETURNING *;
    `;

    const flatValues = orderItemsValues.flat();
    const orderItemsResult = await pool.query(orderItemsQuery, flatValues);

    res.status(200).json({
      status: 200,
      message: "Buyurtma muvaffaqiyatli qo'shildi",
      order: orderResult.rows[0],
      order_items: orderItemsResult.rows,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const { id } = req.user;
    const result = await pool.query(
      `SELECT 
    users.first_name, 
    orders.total_price, 
    products.name
FROM orders
FULL JOIN order_items ON orders.id = order_items.order_id
FULL JOIN users ON orders.user_id = users.id
FULL JOIN products ON order_items.product_id = products.id
WHERE users.id = $1;
        
       `,
      [id]
    );
    res.send(result.rows)
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}
