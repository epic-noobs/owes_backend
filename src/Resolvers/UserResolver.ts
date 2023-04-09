import { isAuth } from "./../isAuth";
import { createRefreshToken, createAccessToken } from "./../auth";
import { AppContext } from "src/AppConext";
import { User } from "../entity/User";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";
import { sendRefreshToken } from "../sendRefreshToken";
import { verify } from "jsonwebtoken";

/**This is what will be returned during login */
@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver(User)
export class UserResolver {
  @UseMiddleware(isAuth)
  @Query(() => String)
  async testQuery(@Ctx() { payload }: AppContext) {
    console.log(payload);
    return `Hello ${payload?.userId}`;
  }

  //attempted register
//   @Mutation(() => Boolean)
//   async register(
//     @Arg("email") email: string,
//     @Arg("password") password: string,
//     @Arg("firstname") firstname: string,
//     @Arg("lastname") lastname: string,
//     @Arg("username") username: string
//   ) {
    
//   }

  /**
   * @description - This function creates a new user and returns a boolean when the user has been created.
   * @param email - {string} email provided by the user.
   * @param password - {string} password provided by the user.
   * @param firstname - {string} firstname provided by the user.
   * @param lastname - {string} lastname provided by the user.
   * @param username - {string} username provided by the user.
   * @returns - {boolean} true if user has been created.
   */
  @Mutation(() => Boolean) // Is this register?
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("firstname") firstname: string,
    @Arg("lastname") lastname: string,
    @Arg("username") username: string
  ) {
    if (username.length < 3 || firstname.length < 3 || lastname.length < 3) {
      throw new Error(
        "Invalid Registration, The username, firstname and lastname should be greater than two characters."
      );
    }
    //Check if user alredy exist.
    const userExist = await User.findOne({ where: { email: email } });
    if (!userExist) {
      //pattern for password to check if the password is strong
      let strongPassword = new RegExp(
        "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
      );
      //Create email pattern.
      let strongEmail = new RegExp(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      );
      if (!strongEmail.test(email)) {
        throw new Error("Not a valid email");
      }
      //Check if password is greater than 8 characters and has a capital letter and special character.
      if (!strongPassword.test(password)) {
        throw new Error("You are not authorized to perform this action.");
      }
      try {
        const hashedPassword = await argon2.hash(password);
        await User.insert({
          email,
          password: hashedPassword,
          firstname,
          lastname,
          username,
        });
        return true;
      } catch (error) {
        console.log("Error: ", error);
        throw new Error(error);
      }
    } else {
      /**
       * send an email to the existing user that an attempt was made to register
       *  with their already existing account.
       */
      console.log("User already exist.");
      throw new Error("User already exist.");
      // TODO: Introduce a logger to keep track of what the users are doing.
      // TODO: Introduce Nodamailer or any other email sending platform.
    }
  }

  /**
   * @description This function revokes the refresh token for user.
   * This will hep when user forgets password so that we revoke all the refresh tokens that the user has.
   * This will also help if the user is hacked and we need to revoke all the refresh tokens.
   * @param userId - The userId of the users refresh token being revoked.
   * @returns {boolean} - true if the revoking succeeded and false if the revoking did not succeed.
   */
  // @Mutation(() => Boolean)
  // async revokeRefreshTokensForUser(@Arg("userId", () => ID) userId: number) {
  //   try {
  //     const userExist = await User.findOne({ where: { id: userId } });
  //     if (!userExist) {
  //       throw new Error("Invalid refresh.");
  //     }
  //     let id = userExist.id;
  //     let token = userExist.tokenVersion;
  //     if (!isNaN(token) ) {
  //       let updatedToken = token + 1;
  //       await User.update({ id }, { tokenVersion: updatedToken });
  //     } else {
  //       throw new Error("Invalid refresh.");
  //     }
  //     return true;
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // }

  /**
   *
   * @param email {string} - email provided by the user to login.
   * @param password {password} - password provided by the user for login.
   * @returns {LoginResponse} - Returns the LiginResponse that consist of the accessToken.
   */
  @Mutation(() => LoginResponse)
  async loginUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: AppContext
  ): Promise<LoginResponse> {
    const userExist = await User.findOne({ where: { email: email } });
    if (!userExist) {
      throw new Error(
        "Invalid Login, please check if the password and email are valid"
      );
    } else {
      try {
        //Compare the input password with the hashed password.
        if (await argon2.verify(userExist.password, password)) {
          //TODO: Set the domain and path at later stage.
          // return an access token.
          sendRefreshToken(res, createRefreshToken(userExist));
          return {
            accessToken: createAccessToken(userExist),
          };
        } else {
          throw new Error(
            "Invalid Login, please check if the password and email are valid"
          );
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /**
   * @description - Gets the user by id.
   * @param context - The data received from the appollo context.
   * @returns - {User} A user that was requested for that user id.
   */
  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async getUser(@Ctx() context: AppContext) {
    //Get the user token from the headers.
    const user = context.req.headers.authorization;
    //Check if user is authenticated.
    if (!user) {
      return null;
    }
    try {
      const token = user.replace("Bearer ", "");
      const foundUser = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as any;
      const result = await User.findOne({ where: { id: foundUser.userId } });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * @description - Updates the user by id.
   * @param context  - The data received from the appollo context.
   * @returns {boolean} - true if user is updated and false if user is not updated
   */
  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async updateUser(
    @Ctx() context: AppContext,
    @Arg("firstname", { nullable: true }) firstname: string,
    @Arg("lastname", { nullable: true }) lastname?: string,
    @Arg("username", { nullable: true }) username?: string
  ) {
    //Get the user token from the headers.
    const user = context.req.headers.authorization;
    //Check if user is authenticated.
    if (!user) {
      throw new Error("not authenticated");
    }
    try {
      const token = user.replace("Bearer ", "");
      const foundUser = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as any;
      if (firstname || lastname || username) {
        await User.update(
          { id: foundUser.userId },
          {
            firstname,
            lastname,
            username,
          }
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong, please try again.");
    }
  }
}
