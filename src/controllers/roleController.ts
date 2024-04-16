import { RequestHandler } from "express";
import { catchErrorResponse } from "../constants/response";
import { roleNameValidation } from "../validator";
import { db } from "../db/index";
import { Snowflake } from "@theinternetfolks/snowflake";

export const createRoleController: RequestHandler = async (req, res) => {
  try {
    const { name } = req.body;
    const { error } = roleNameValidation.validate({ name });
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "name",
            message: "Name should be at least 2 characters.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    const date = new Date();
    const role = await db.role.create({
      data: {
        id: Snowflake.generate(),
        name,
        updated_at: date,
        created_at: date,
      },
    });
    return res.status(200).json({
      status: true,
      content: {
        data: role,
      },
    });
  } catch (error) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getAllRoleController: RequestHandler = async (req, res) => {
  try {
    const limit = 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const count = await db.role.count();
    const roles = await db.role.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "desc",
      },
    });
    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: count,
          pages: Math.ceil(count / limit),
          page,
        },
        data: roles,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(catchErrorResponse);
  }
};
