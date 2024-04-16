import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import dbConnect from "./db";
const router = express.Router();
dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dbConnect(prisma);

const PORT = process.env.PORT || 8000;

app.use("/v1", router);

routes(router);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
