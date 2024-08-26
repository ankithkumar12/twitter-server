import { prismaClient } from "../clients/db";

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
  region: process.env.AWS_DEFAULT_REGION,
});

class TweetService {
  public static async getAllTweets() {
    const tweets = await prismaClient.tweet.findMany({
      orderBy: { createdAt: "desc" },
    });

    return tweets;
  }

  public static async getTweetsByAuthorID(authorId: string) {
    const tweets = await prismaClient.tweet.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });

    return tweets;
  }

  public static async getSignedURL(
    imageType: string,
    imageName: string,
    id: string
  ) {
    const allowedTypes = ["jpg", "jpeg", "png", "webp"];

    console.log("ImageType");
    console.log(imageType);

    if (!allowedTypes.includes(imageType)) {
      throw new Error("Invalid image type");
    }

    const params: typeof PutObjectCommandInput = {
      Key: `uploads/tweets/${id}/images/${imageName}-${Date.now()}.${imageType}`,
      ContentType: imageType,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Metadata: { "Content-Type": imageType },
    };

    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(client, command, { expiresIn: 300 });

    return url;
  }

  public static async createTweetByUserID(
    payload: CreateTweetContent,
    id: string
  ) {
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        author: { connect: { id: id } },
      },
    });

    return tweet;
  }
}

export { TweetService, CreateTweetContent };
