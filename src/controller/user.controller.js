import { Router } from "express";
import { deleteUser, getAlluser, test, testkorish, updateUser, userLogin, userRegister } from "../core/users/user.service.js";
const userRouter = Router();
import { userLoginGuard } from "../common/guard/auth.guard.js";

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.get('/getall',userLoginGuard,getAlluser)
userRouter.delete("/delete/",userLoginGuard, deleteUser)
userRouter.put('/update/:id',updateUser)
userRouter.post('/test/qoshish',test)
userRouter.post('/test/korish',testkorish)
export default userRouter;

