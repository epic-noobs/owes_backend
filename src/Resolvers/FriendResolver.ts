import { Friend } from "../entity/Friend";
import {
    Arg,
    Mutation,
    Resolver,
  } from "type-graphql";

@Resolver(Friend)
export class FriendResolver {

  @Mutation(() => Boolean)
  async test_follower(
    @Arg("following_user") following_user: string,
    @Arg("followed_user") followed_user: string,
  ) {
    await Friend.insert({
        following_user,
        followed_user
    })
    return true
  }

}
