import { PrismaClient } from "@prisma/client";

export let db: PrismaClient;

const dbConnect = async (tempDB: PrismaClient) => {
  try {
    await tempDB.$connect();
    db = tempDB;
    console.log("Database connected");
  } catch (e) {
    console.log(e);
  }
};

export default dbConnect;
