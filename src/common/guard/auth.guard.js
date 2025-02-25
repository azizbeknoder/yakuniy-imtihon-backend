import jwt from "jsonwebtoken";
import { pool } from "../database/dbConnect.service.js";
import getConfig from "../config/config.service.js";

export async function userLoginGuard(req, res, next) {
  try {
    // console.log(req);
    
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    
    if (!authHeader) {
      return res.status(401).send({ message: "Token topilmadi" });
    }

    const token = authHeader.split(" ")[1];
    const login = await accessTokenVerify(token);
    if (!login) {
      return res
        .status(401)
        .send({ message: "Token noto'g'ri yoki muddati o'tgan" });
    }

    const user = await findByLogin(login);
    if (!user) {
      return res.status(401).send({ message: "Foydalanuvchi topilmadi" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("userLoginGuard error:", err);
    res
      .status(500)
      .send({ message: err.message || "Serverda xatolik yuz berdi" });
  }
}

export async function accessTokenVerify(token) {
  try {
    const decoded = jwt.verify(token, getConfig("ACCES_SECRET"));
    return decoded.login;
  } catch (err) {
    console.log("Token noto'g'ri yoki muddati o'tgan");
    return null;
  }
}

export async function generateAccessToken(login) {
  const payload = { login };
  return jwt.sign(payload, getConfig("ACCES_SECRET"), { expiresIn: "1h" });
}

export async function findByLogin(login) {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      login,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log("Loginni qidirishda xatolik yuz berdi");
    return null;
  }
}
