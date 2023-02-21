import { AppContext } from "src/AppConext";
import { User } from "../entity/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

@Resolver(User)
export class UserResolver {
  @Query(() => String)
  async testQuery(@Ctx() { req }: AppContext) {
    console.log("testing");
    return req;
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
}
