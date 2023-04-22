import { MiddlewareFn } from "type-graphql";
import { AppContext } from "src/AppConext";
import { verify } from "jsonwebtoken";


export const checkFriendship: MiddlewareFn<AppContext> = ({ context }, next) => {
    const user = context.req.headers["authorization"];
    //if the user did not pass in the header. Throw an error.
    if (!user) {
      throw new Error("not authenticated");
    }
    try {
        const token = user.replace("Bearer ", "");
        const foundUser = verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as any;
        // check friendship.
    } catch (err) {
      throw new Error("not a friend");
    }
    return next();
  };