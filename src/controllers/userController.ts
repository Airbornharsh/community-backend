import { RequestHandler } from "express";
import { signinValidation, userValidation } from "../validator";
import { db } from "../db/index";
import { encode } from "../utils/token";
import bcrypt from "bcrypt";
import { UserToken } from "../middlewares/authMiddleware";
import { NoUserResponse, catchErrorResponse } from "../constants/response";
import { Snowflake } from "@theinternetfolks/snowflake";

export const signupController: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { error } = userValidation.validate({ name, email, password });
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [
          ...error.details.map((e) => ({
            param: e.context?.key,
            message: e.message,
            code: "INVALID_INPUT",
          })),
        ],
      });
    }
    const userExists = await db.user.findFirst({
      where: {
        email,
      },
    });
    if (userExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "User with this email address already exists.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    const user = await db.user.create({
      data: {
        id: Snowflake.generate(),
        name,
        email,
        password: hashPassword,
        created_at: new Date(),
      },
    });
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
    const token = encode(userData);
    if (!token) {
      return res.status(500).json({
        status: false,
        errors: [
          {
            message: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
          },
        ],
      });
    }
    res.cookie("access_token", token);
    return res.status(200).json({
      status: true,
      content: {
        data: userData,
        meta: {
          access_token: token,
        },
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const signinController: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    var { error } = signinValidation.validate({ email });
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "Please provide a valid email address.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    const user = await db.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "User with this email address does not exist.",
            code: "INVALID_CREDENTIALS",
          },
        ],
      });
    }
    const samePassword = bcrypt.compareSync(password, user.password);
    if (!samePassword) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "password",
            message: "The credentials you provided are invalid.",
            code: "INVALID_CREDENTIALS",
          },
        ],
      });
    }
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
    const token = encode(userData);
    if (!token) {
      return res.status(500).json({
        status: false,
        errors: [
          {
            message: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
          },
        ],
      });
    }
    res.cookie("access_token", token);
    return res.status(200).json({
      status: true,
      content: {
        data: userData,
        meta: {
          access_token: token,
        },
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getUserData: RequestHandler = async (req, res) => {
  try {
    const user = res.locals.user as UserToken | null;
    if (user === null) {
      return res.status(401).json(NoUserResponse);
    }
    return res.status(200).json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};
