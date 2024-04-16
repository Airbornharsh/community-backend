import { RequestHandler } from "express";
import { db } from "../db/index";
import { decode } from "../utils/token";

export interface UserToken {
  id: string;
  name: string;
  email: string;
  created_at: string;
  iat: number;
}

export const verifyToken: RequestHandler = async (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    res.locals.user = null;
    return next();
  }
  try {
    if (!access_token) {
      res.locals.user = null;
    } else {
      const tempUser = decode(access_token) as UserToken;
      const user = await db.user.findFirst({
        where: {
          id: tempUser?.id,
        },
      });
      res.locals.user = user;
    }
  } catch (e) {
    res.locals.user = null;
  }
  next();
};
