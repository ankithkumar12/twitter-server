import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../intefaces";
import { TweetService, CreateTweetContent } from "../../services/tweetService";
import UserService from "../../services/userService";

const mutations = {
  createTweet: async (
    _: any,
    { payload }: { payload: CreateTweetContent },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You need to be logged in");

    return await TweetService.createTweetByUserID(payload, ctx.user.id);
  },
};

const queries = {
  getAllTweets: async () => {
    return await TweetService.getAllTweets();
  },

  getSignedURL: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx || !ctx.user?.id) throw new Error("Unauthenticated");

    return await TweetService.getSignedURL(imageType, imageName, ctx.user.id);
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => {
      return UserService.getCurrentUserByID(parent.authorId);
    },
  },
};


export const resolvers = { mutations, extraResolvers, queries };
