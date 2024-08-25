import { PrismaClient, Tweet } from "@prisma/client";
import { GraphqlContext } from "../../intefaces";
import { prismaClient } from "../../clients/db";

interface CreateTweetContent {
  content: string;
  imageUrl?: string;
}
const mutations = {
  createTweet: async (
    _: any,
    { payload }: { payload: CreateTweetContent },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You need to be logged in");

    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        author: { connect: { id: ctx.user.id } },
        
      },
    });

    return tweet;
  },
};

const queries = {
  getAllTweets: async () => {
    return await prismaClient.tweet.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => {
      return prismaClient.user.findUnique({ where: { id: parent.authorId } });
    },
  },
};
export const resolvers = { mutations, extraResolvers,queries };
