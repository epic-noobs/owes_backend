import { verify } from "jsonwebtoken";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { UserResolver } from "./Resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import { json } from "body-parser";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

(async () => {
  dotenv.config();
  const app = express();
  app.use(cookieParser());

  /**
   * @description This route is for only handling the JWT token.
   * We don't want to go to /graphql when doing this.
   * So we can specify that the cookie only works on this route.
   * This may help with security because our token will only be sent when we are refreshing.
   * The method will read the refresh cookie then validate that the token is correct.
   * Then, send the user back a new access token.
   * Note: Use postman to test this.
   */
  app.post("/refresh_token", async (req, res) => {
    //read cookie.
    const token = req.cookies.sid;
    //If token is invalid. Don't send back an access token.
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload = null;
    try {
      payload = verify(
        token,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as any; //verify if the token is valid.
    } catch (error) {
      return res.send({ ok: false, accessToken: "" });
    }
    const user = await User.findOne({ where: { id: payload.userId } }); //find user for this id.
    //If user does not exist. Don't send back an access token.
    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    //If the user token version is not equal to the version in the payload then the token is invalid.
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));
    //Send back access token
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [UserResolver],
    validate: { forbidUnknownValues: false },
  });

  // Set up Apollo Server.
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  //Start appollo server.
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  //Initialize initial connection with the database.
  AppDataSource.initialize();

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
})();
