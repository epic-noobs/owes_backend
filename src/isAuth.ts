import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { AppContext } from "src/AppConext";

/**
 * @description This is a middleware that checks if the user is authorised to use our mutation or query
 * We expect the user to send a header which says authorization of the formart bearer <Token>
 * */
export const isAuth: MiddlewareFn<AppContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  //if the user did not pass in the header. Throw an error.
  if (!authorization) {
    console.log("help");
    throw new Error("not authenticated");
  }
  try {
    const token = authorization.replace("Bearer", ""); // Take out the word "bearer" to get only the token.
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET as string); //verify if the token is valid.
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("not authenticated");
  }
  return next();
};
