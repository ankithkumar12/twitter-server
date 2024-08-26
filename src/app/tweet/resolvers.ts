import { PrismaClient, Tweet } from "@prisma/client";
import { GraphqlContext } from "../../intefaces";
import { prismaClient } from "../../clients/db";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} = require("@aws-sdk/client-s3");

interface CreateTweetContent {
  content: string;
  imageUrl?: string;
}

const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAXQIQAO6XNAWQRXZQ",
    secretAccessKey: "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",
  },
});

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

  getSignedURL: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx || !ctx.user?.id) throw new Error("Unauthenticated");

    const allowedTypes = ["jpg", "jpeg","png", "webp"];
    
    console.log("ImageType")
    console.log(imageType)

    if (!allowedTypes.includes(imageType)) {
      throw new Error("Invalid image type");
    }

    const params:typeof PutObjectCommandInput={
      Key: `uploads/tweets/${
        ctx.user.id
      }/images/${imageName}-${Date.now()}.${imageType}`,
      ContentType: imageType,
      Bucket: "ankith-twitter-dev",
      Metadata: { "Content-Type": imageType },
    };

    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(client, command, { expiresIn: 300 });

    return url;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => {
      return prismaClient.user.findUnique({ where: { id: parent.authorId } });
    },
  },
};
export const resolvers = { mutations, extraResolvers, queries };
