import {Router} from 'express'
import {userLoginGuard} from '../common/guard/auth.guard.js'
import { getAllOrders, ordersAdd } from '../core/orders/order.service.js'

const orderRouter = Router()

orderRouter.post('/add',userLoginGuard,ordersAdd)
orderRouter.get("/get",userLoginGuard,getAllOrders   )

export default orderRouter