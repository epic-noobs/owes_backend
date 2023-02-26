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

  /**
   * @description - This function creates a new user and returns a boolean when the user has been created.
   * @param email - {string} email provided by the user.
   * @param password - {string} password provided by the user.
   * @param firstname - {string} firstname provided by the user.
   * @param lastname - {string} lastname provided by the user.
   * @param username - {string} username provided by the user.
   * @returns - {boolean} true if user has been created.
   */
  @Mutation(() => Boolean)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("firstname") firstname: string,
    @Arg("lastname") lastname: string,
    @Arg("username") username: string
  ) {
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
}
