import { Friend } from "../entity/Friend";
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import { isAuth } from "./../isAuth";
import { AppContext } from "src/AppConext";
import { verify } from "jsonwebtoken";
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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async sendFriendRequest(
        @Ctx() context: AppContext,
        @Arg("followed_user") followed_user: string,
    ) {
        const user = context.req.headers.authorization;
        try {
            const token = user?.replace("Bearer ", "");
            const foundUser = verify(
                token as string,
                process.env.ACCESS_TOKEN_SECRET as string
            ) as any;

            // logged in user
            const sender = await User.findOne({ where: { id: foundUser.userId } });
            // user that's gonna get followed
            const receiver = await User.findOne({ where: { id: followed_user } });

            if (!sender || !receiver) {
                throw new Error('Invalid sender or receiver ID');
            }

            // insert data into friend entity
            await Friend.insert({
                following_user: sender.id, // sender
                followed_user // receiver
            })

            // Returns true once friend request has been sent
            return true
        } catch (error) {
            console.log(`\n ${error}`);
            return false;
        }

    }
}
