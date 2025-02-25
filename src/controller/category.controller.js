import { Router } from "express";
import { userLoginGuard } from "../common/guard/auth.guard.js";
import { addCategroy, deleteCategory, getAllCategory, getOneCategory } from "../core/category/category.service.js";

const categoryRouter = Router()

categoryRouter.post('/add',userLoginGuard,addCategroy)
categoryRouter.get('/get',userLoginGuard,getAllCategory)
categoryRouter.get('/get/:id',userLoginGuard,getOneCategory)
categoryRouter.delete('/delete/:id',userLoginGuard,deleteCategory)

export default categoryRouter