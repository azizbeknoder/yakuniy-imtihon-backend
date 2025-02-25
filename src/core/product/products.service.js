import { pool } from "../../common/database/dbConnect.service.js";
import fs from "fs";
import path from "path";

export async function addProducts(req, res) {
  try {
    const body = JSON.parse(req.body.json_data);
    
    

    const imgUrl = await addPhotos(req);
    const result = await pool.query(
      `INSERT INTO products(name,description,price,stock,category_id,image_url,user_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        body.name,
        body.description,
        body.price,
        body.stock,
        body.category_id,
        imgUrl,
        req.user.id
      ]
    );

    res.status(200).send({ status: 200, message: result.rows[0] });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}

export async function getAllProducts(req, res) {
  try {
    console.log('sorov keldi');
    
    const result = await pool.query(`SELECT * FROM products`);
    res.status(200).send({ status: 200, message: result.rows });
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}

export async function getOneProducts(req, res) {
  try {
    const { id } = req.params;
    const check = await findByProductId(id);
   
    if (!check) {
      return res.send({ status: 400, message: "Bunday product topilmadi" });
    }
    const result = await pool.query(`SELECT * FROM products WHERE id=$1`,[id])
    res.send({status:200, message: result.rows[0]})
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
}

export async function deleteProducts(req, res) {
    try {
        const { id } = req.params;

        // Mahsulot mavjudligini tekshiramiz
        const check = await findByProductId(id);
        if (!check) {
            return res.status(404).send({ message: 'Ma’lumot topilmadi', status: 404 });
        }

        // Mahsulotni o‘chirish
        const result = await pool.query(`DELETE FROM products WHERE id=$1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Mahsulot topilmadi yoki allaqachon o‘chirilgan', status: 404 });
        }
         if (result.rows[0].image_url.length > 0) {
           result.rows[0].image_url.map((e) => {
             fs.unlinkSync(e);
           });
         }

        return res.status(200).send({ status: 200, message: 'Mahsulot o‘chirildi', data: result.rows[0] });
    } catch (err) {
        return res.status(500).send({ status: 500, message: err.message });
    }
}

export async function customerProducts(req,res) {
  try{
    const id = req.user.id
    const result = await pool.query(
      `SELECT * FROM products WHERE user_id = $1`,[id]
    );
    res.status(200).send(result.rows)

  }catch(err){
    res.status(500).send({status:500,message:err.message})
  }
  
}

export async function addPhotos(req) {
  try {
    if (!req.files || req.files.length === 0) {
      return { status: 400, message: "Hech qanday rasm yuklanmadi" };
    }

    const imageDir = path.join(process.cwd(), "images");

    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const imagePaths = [];
    for (const file of req.files) {
      const imagePath = path.join(
        imageDir,
        `${Date.now()}_${file.originalname}`
      );

      fs.writeFileSync(imagePath, file.buffer);

      imagePaths.push(imagePath);
    }

    return imagePaths;
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function findByProductId(id) {
  const result = await pool.query(`SELECT * FROM products WHERE id=$1`, [id]);
  return result.rows[0];
}
