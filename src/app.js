import express from "express";
import cors from "cors";
import configFunction from "./common/config/config.service.js";
import { initDatabase } from "./common/database/dbConnect.service.js";
import userRouter from "./controller/user.controller.js";
import categoryRouter from "./controller/category.controller.js";
import productRouter from "./controller/products.controller.js";
import orderRouter from "./controller/orders.controller.js";

const app = express();

async function init() {
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

// app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use("/user", userRouter);
  app.use('/category',categoryRouter )
  app.use('/product',productRouter)
  app.use('/order',orderRouter)

  const PORT = configFunction("EXPRESS_PORT") || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Running on http  http://192.168.1.228:${PORT}`);
  });
  initDatabase();
}

init();
