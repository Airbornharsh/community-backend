import { RequestHandler } from "express";
import { NoUserResponse, catchErrorResponse } from "../constants/response";
import { UserToken } from "../middlewares/authMiddleware";
import { communityNameValidation } from "../validator";
import{ db } from "../db/index";
import { Snowflake } from "@theinternetfolks/snowflake";

export const createCommunityController: RequestHandler = async (req, res) => {
  try {
    const user = res.locals.user as UserToken | null;
    if (user === null) {
      return res.status(401).json(NoUserResponse);
    }
    const { name } = req.body;
    const { error } = communityNameValidation.validate({ name });
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
    const slugExists = await db.community.findFirst({
      where: {
        slug: name.toLowerCase().replace(" ", "-"),
      },
    });
    if (slugExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "name",
            message: "Community with this name already exists.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }
    const date = new Date();
    const community = await db.community.create({
      data: {
        id: Snowflake.generate(),
        name,
        slug: name.toLowerCase().replace(" ", "-"),
        updated_at: date,
        owner: user.id,
        created_at: date,
      },
    });
    const role = await db.role.create({
      data: {
        id: Snowflake.generate(),
        name: "Community Admin",
        created_at: date,
        updated_at: date,
      },
    });
    const member = await db.member.create({
      data: {
        id: Snowflake.generate(),
        user: user.id,
        community: community.id,
        role: role.id,
        created_at: date,
      },
    });
    await db.community.update({
      where: {
        id: community.id,
      },
      data: {
        members: {
          connect: {
            id: member.id,
          },
        },
      },
    });
    return res.status(200).json({
      status: true,
      content: {
        data: community,
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getAllCommunityController: RequestHandler = async (req, res) => {
  try {
    const limit = 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const count = await db.community.count();
    const communities = await db.community.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        ownerRef: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const tempCommunities = communities.map((community) => {
      return {
        ...community,
        owner: {
          id: community.ownerRef.id,
          name: community.ownerRef.name,
        },
        ownerRef: undefined,
      };
    });
    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: count,
          pages: Math.ceil(count / limit),
          page,
        },
        data: tempCommunities,
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getMembersCommunityController: RequestHandler = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const limit = 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;

    const community = await db.community.findFirst({
      where: {
        id,
      },
      include: {
        members: {
          include: {
            userRef: {
              select: {
                id: true,
                name: true,
              },
            },
            roleRef: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!community) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Community not found",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    const totalCount = community.members.length;
    const totalPages = Math.ceil(totalCount / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalCount);

    const members = community.members
      .slice(startIndex, endIndex)
      .map((member) => ({
        id: member.id,
        community: id,
        user: {
          id: member.userRef.id,
          name: member.userRef.name,
        },
        role: {
          id: member.roleRef.id,
          name: member.roleRef.name,
        },
        created_at: member.created_at,
      }));

    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: totalCount,
          pages: totalPages,
          page,
        },
        data: members,
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getOwnedCommunityController: RequestHandler = async (req, res) => {
  try {
    const user = res.locals.user as UserToken | null;
    if (user === null) {
      return res.status(401).json(NoUserResponse);
    }
    const limit = 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const count = await db.community.count({
      where: {
        owner: user.id,
      },
    });
    const communities = await db.community.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        owner: user.id,
      },
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
        data: communities,
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};

export const getJoinedCommunityController: RequestHandler = async (
  req,
  res
) => {
  try {
    const user = res.locals.user as UserToken | null;
    if (user === null) {
      return res.status(401).json(NoUserResponse);
    }
    const limit = 50;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const count = await db.member.count({
      where: {
        user: user.id,
      },
    });
    const members = await db.member.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        user: user.id,
      },
      include: {
        communityRef: {
          include: {
            ownerRef: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const tempMembers = members.map((member) => {
      return {
        id: member.communityRef.id,
        name: member.communityRef.name,
        slug: member.communityRef.slug,
        owner: {
          id: member.communityRef.ownerRef.id,
          name: member.communityRef.ownerRef.name,
        },
        created_at: member.created_at,
      };
    });
    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: count,
          pages: Math.ceil(count / limit),
          page,
        },
        data: tempMembers,
      },
    });
  } catch (e) {
    return res.status(500).json(catchErrorResponse);
  }
};
