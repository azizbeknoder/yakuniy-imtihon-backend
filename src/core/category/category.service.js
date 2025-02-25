import { pool } from "../../common/database/dbConnect.service.js";

export async function addCategroy(req, res) {
  try {
    const body = req.body;

    const check = await findByCategory(body.name);
    if (check) {
      return res
        .status(403)
        .send({ status: 403, message: "Category already exists" });
    }
    const result = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
      [body.name]
    );
    res.status(200).send({ message: result.rows[0], status: 200 });
  } catch (err) {
    res.status(500).send({ message: err.message, status: 500 });
  }
}
export async function getAllCategory(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM categories`);
    res.status(200).send({ status: 200, message: result.rows });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}
export async function getOneCategory(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM categories WHERE id = $1`,[id]);
    res.status(200).send({ status: 2000, message: result.rows[0] });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}
export async function deleteCategory(req,res) {
    try{
        const {id} = req.params
        const result = await pool.query(`DELETE FROM categories WHERE id=$1 RETURNING *`,[id])
        res.status(200).send({status:200, message:result.rows[0]})

    }catch(err){
        res.status(500).send({status:500,message:err.message})
    }
    
}

async function findByCategory(name) {
  try {
    const result = await pool.query(`SELECT * FROM categories WHERE name =$1`, [
      name,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log(err.message);
  }
}
