import { AppContext } from "src/AppConext";
import { User } from "../entity/User";
import { Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolver {
    @Query(() => String)
    async testQuery(@Ctx() { req }: AppContext) {
        console.log("testing");
        return req;
    }

    @Mutation(() => Boolean)
    async testMutation() {
        await User.insert({
            firstName: "Red",
            lastName:"Colour",
            age:100,
          });

          return true;
    }
}