import { Router } from "express";
import { userLoginGuard } from "../common/guard/auth.guard.js";
import { addProducts, customerProducts, deleteProducts, getAllProducts, getOneProducts } from "../core/product/products.service.js";
import { upload } from "../common/config/multer.service.js";
const productRouter = Router();

productRouter.post("/add", userLoginGuard, upload, addProducts);
productRouter.get('/get',userLoginGuard,getAllProducts)
productRouter.get('/get/:id',userLoginGuard,getOneProducts)
productRouter.get('/getcustomer',userLoginGuard,customerProducts)
productRouter.delete('/delete/:id',userLoginGuard,deleteProducts)

export default productRouter;

