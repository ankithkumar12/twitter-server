import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../intefaces";
import { User } from "@prisma/client";
import UserService from "../../services/userService";
import { TweetService } from "../../services/tweetService";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resToken = await UserService.verifyGoogleAuthToken(token);
    return resToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await UserService.getCurrentUserByID(id);
    return user;
  },

  getUserByID: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    const user = await UserService.getCurrentUserByID(id);
    return user;
  },
};

const extraResolvers = {
  User: {
    tweets: async (parent: User) => {
      return TweetService.getTweetsByAuthorID(parent.id);
    },
  },
};

export const resolvers = { queries, extraResolvers };
