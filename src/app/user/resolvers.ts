import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../intefaces";

import UserService from "../../services/userService";
import { TweetService } from "../../services/tweetService";
import { User } from "@prisma/client";

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

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw Error("UnAutheticated");
    return await UserService.followUser(ctx.user?.id, to);
  },

  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw Error("UnAutheticated");
    return await UserService.unfollowUser(ctx.user?.id, to);
  },
};

const extraResolvers = {
  User: {
    tweets: async (parent: User) => {
      return TweetService.getTweetsByAuthorID(parent.id);
    },

    followers: async (parent: User) => {
      console.log(parent.id);
      const res = await prismaClient.follows.findMany({
        where: {
          followingID: parent.id,
        },
        include: {
          follower: true,
          following: true,
        },
      });

      // console.log("resolver for folllower");
      // console.log(res);

      return res.map((el) => el.follower);
    },

    following: async (parent: User) => {
      const res = await prismaClient.follows.findMany({
        where: {
          followerID: parent.id,
        },
        include: {
          follower: true,
          following: true,
        },
      });

      // console.log("resolver for folllowing");
      // console.log(res);

      return res.map((el) => el.following);
    },

    recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user || !ctx.user.id) return [];

      const myFollowing = await prismaClient.follows.findMany({
        where: {
          follower: { id: ctx.user.id },
        },
        include: {
          following: {
            include: { follower: { include: { following: true } } },
          },
        },
      });

      const users: User[] = [];

      for (const followings of myFollowing) {
        for (const followingofFollowedUser of followings.following.follower) {
          if (
            followingofFollowedUser.followingID !== ctx.user.id &&
            myFollowing.findIndex(
              (e) => e.followingID === followingofFollowedUser.following.id
            ) < 0
          ) {
             users.push(followingofFollowedUser.following);
          }
        }
      }
      return users;
    },
  },
};

export const resolvers = { queries, extraResolvers, mutations };
