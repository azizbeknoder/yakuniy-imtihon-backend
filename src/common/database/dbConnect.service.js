import pkg from "pg";
import getConfig from "../config/config.service.js";
const { Pool } = pkg;
import bcrypt from "bcrypt";

export const pool = new Pool({
  database: getConfig("DATABASE_NAME"),
  user: getConfig("DATABASE_USER"),
  password: getConfig("DATABASE_PASSWORD"),
  host: getConfig("DATABASE_HOST"),
  port: parseInt(getConfig("DATABASE_PORT")),
});

export async function initDatabase() {
  await connectToDb();
  await createTable();
  // await createAdmin();
}

async function connectToDb() {
  try {
    await pool.connect();
    console.log("Bazaga ulandi");
  } catch (err) {
    console.log("Bazaga ulanishda hatolik:", err.message);
  }
}
async function createTable() {
  try {
    await pool.query(`
 -- Foydalanuvchilar jadvali
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',  -- 'admin' yoki 'customer'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kategoriyalar jadvali
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mahsulotlar jadvali
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,  -- Mahsulotni qo‘shgan foydalanuvchi
    image_url TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);



-- Savatcha jadvali (Foydalanuvchilarning savatchasini saqlash)
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buyurtmalar jadvali
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'completed', 'canceled'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buyurtmalar mahsulotlari (bir buyurtmada bir nechta mahsulot bo‘lishi mumkin)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL
);

-- To‘lovlar jadvali
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,  -- 'card', 'payme', 'stripe'
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

      CREATE TABLE IF NOT EXISTS test(
      id SERIAL PRIMARY KEY,
      ism VARCHAR(255),
      nomi VARCHAR(255),
      soni INT
      )


        `);
    console.log("tablelar yaratildi");
  } catch (err) {
    console.log(err.message);
  }
}
