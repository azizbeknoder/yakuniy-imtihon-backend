import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loginValidate, registerValidate } from "./user.validate.js";
import { pool } from "../../common/database/dbConnect.service.js";

export async function userRegister(req, res) {
  const body = req.body;

  // Ma'lumotlarni validatsiya qilish
  const { error } = registerValidate.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Foydalanuvchi avval ro‘yxatdan o‘tganligini tekshirish
    const existingUser = await findByEmail(body.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Yangi adminni yaratish
    const newUser = await createUser({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hashedPassword,
      role: "customer",
    });

    // JWT token yaratish
    const accessToken = createAccessToken(newUser.email);
    const refreshToken = createRefreshToken(newUser.email);

    console.log("Foydalanuvchi");

    // Javob qaytarish
    res.status(201).json({
      message: "Admin registered successfully",
      access_token: accessToken,
      refresh_token: refreshToken,
      status:200
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function userLogin(req, res) {
  const body = req.body;
  const { error } = loginValidate.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const oldUser = await findByEmail(body.email);
  if (!oldUser) {
    return res.status(400).json({ message: "Invalid login or password ad" });
  }
  const isValidPassword = await bcrypt.compare(body.password, oldUser.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid login or password ad" });
  }
  const accessToken = createAccessToken(oldUser.email);
  const refreshToken = createRefreshToken(oldUser.email);
  console.log("login qildi");


  res.status(200).send({
    message: "Login Succesfly",
    access_token: accessToken,
    refresh_token: refreshToken,
    status: 200
  });

  try {
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}
export async function getAlluser(req,res) {
  try{
    const result = await pool.query(`SELECT * FROM users`)
    res.send({status:200,message: result.rows})

  }catch(err){
    res.status(500).send({message:err.message, status: 500})
  }
  
}

export async function deleteUser(req,res) {
  try{
      const {id} = req.user
      const oldUser = await findById(id)
      if(!oldUser){
        return  res.status(500).send({status:401, message:"Foydalanuvchi topilmadi"})

      }
      const result = await pool.query(`DELETE FROM users WHERE id =$1  RETURNING *`,[id])
      res.status(200).send({stauts:200, message:result.rows[0]})

  }catch(err){
    res.status(500).send({message:err.message, status: 500})
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    // Foydalanuvchi mavjudligini tekshirish
    const oldUser = await findById(id);
    if (!oldUser) {
      return res
        .status(404)
        .send({ status: 404, message: "Foydalanuvchi topilmadi" });
    }

    // Yangilanish uchun yangi qiymatlarni olish
    const updatedFields = {
      first_name: body.first_name || oldUser.first_name,
      last_name: body.last_name || oldUser.last_name,
      email: body.email || oldUser.email,
      role: body.role || oldUser.role,
    };

    // Foydalanuvchini yangilash
    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4 WHERE id = $5 RETURNING *`,
      [
        updatedFields.first_name,
        updatedFields.last_name,
        updatedFields.email,
        updatedFields.role,
        id,
      ]
    );

    res
      .status(200)
      .send({
        status: 200,
        message: "Foydalanuvchi yangilandi",
        user: result.rows[0],
      });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
}




export async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0]; // Foydalanuvchi topilsa qaytaradi
}
export async function findById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  return result.rows[0]; // Foydalanuvchi topilsa qaytaradi
}

export async function createUser(user) {
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [user.first_name, user.last_name, user.email, user.password, user.role]
  );
  return result.rows[0]; // Yangi foydalanuvchini qaytaradi
}

function createAccessToken(login) {
  if (!process.env.ACCES_SECRET) {
    throw new Error("ACCES_SECRET aniqlanmagan");
  }
  return jwt.sign({ login }, process.env.ACCES_SECRET, {
    expiresIn: "1d",
  });
}
function createRefreshToken(login) {
  if (!process.env.ACCES_SECRET) {
    throw new Error("ACCES_SECRET aniqlanmagan");
  }
  return jwt.sign({ login }, process.env.REFRESH_SECRET, {
    expiresIn: "3d",
  });
}


export async function test(req,res) {
  try{
   const body = req.body;
   const result = await pool.query(`INSERT INTO test(ism,nomi,soni) VALUES($1,$2,$3)  RETURNING *`,[body.ism,body.nomi,body.soni])

    res.send(result.rows[0])
  }catch(err){
    res.status(500).send({status:500,message:err.message})
  }
  
}
export async function testkorish(req, res) {
  try {
    const {ism} = req.body
    console.log(ism);
    
    const result = await pool.query(`SELECT * FROM test WHERE ism=$1`,[ism])
    res.send(result.rows)
    console.log(result.rows);
    
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}

