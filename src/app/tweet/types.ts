export const types = `#graphql

   input CreateTweetContent{
    content:String!
    imageUrl:String
   }


   type Tweet{
    id: ID!
    content:String!
    imageUrl:String

    author:User
   }
`;
