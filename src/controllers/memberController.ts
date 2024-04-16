import { RequestHandler } from "express";
import { NoUserResponse, catchErrorResponse } from "../constants/response";
import { UserToken } from "../middlewares/authMiddleware";
import { db } from "../db/index";
import { Snowflake } from "@theinternetfolks/snowflake";

export const createMemberController: RequestHandler = async (req, res) => {
  try {
    const tempUser = res.locals.user as UserToken | null;
    if (tempUser === null) {
      return res.status(401).json(NoUserResponse);
    }
    const { community, user, role } = req.body;
    const communityExists = await db.community.findFirst({
      where: {
        id: community,
      },
    });
    if (!communityExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "community",
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    const memberWithUserRole = await db.member.findMany({
      where: {
        community: community,
      },
      include: {
        userRef: true,
        roleRef: true,
      },
    });

    const admin = memberWithUserRole.find((member) => {
      return (
        member.userRef.id === tempUser.id &&
        member.roleRef.name === "Community Admin"
      );
    });
    if (!admin) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
    const userExists = await db.user.findFirst({
      where: {
        id: user,
      },
    });
    if (!userExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "user",
            message: "User not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    const roleExists = await db.role.findFirst({
      where: {
        id: role,
      },
    });
    let roleId = "";
    if (!roleExists) {
      const date = new Date();
      const role = await db.role.create({
        data: {
          id: Snowflake.generate(),
          name: "Community Member",
          updated_at: date,
          created_at: date,
        },
      });
      roleId = role.id;
    } else {
      roleId = role;
    }
    const memberExists = await db.member.findFirst({
      where: {
        community: community,
        user: user,
      },
    });
    if (memberExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "User is already added in the community.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }
    const member = await db.member.create({
      data: {
        id: Snowflake.generate(),
        roleRef: { connect: { id: roleId } },
        userRef: { connect: { id: user } },
        communityRef: { connect: { id: community } },
        created_at: new Date(),
      },
    });
    return res.status(200).json({
      status: true,
      content: {
        data: member,
      },
    });
  } catch (error) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const removeMemberController: RequestHandler = async (req, res) => {
  try {
    const user = res.locals.user as UserToken | null;
    if (user === null) {
      return res.status(401).json(NoUserResponse);
    }
    const { id } = req.params;
    const member = await db.member.findFirst({
      where: {
        id,
      },
      include: {
        communityRef: {
          include: {
            members: {
              where: {
                user: user.id,
              },
              include: {
                roleRef: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!member) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Member not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    if (
      member?.communityRef.members[0]?.roleRef.name !== "Community Admin" &&
      member?.communityRef.members[0]?.roleRef.name !== "Community Moderator"
    ) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
    await db.member.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    return res.status(500).json(catchErrorResponse);
  }
};
