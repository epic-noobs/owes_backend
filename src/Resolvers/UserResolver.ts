import { AppContext } from "src/AppConext";
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
          return true;
    }
}