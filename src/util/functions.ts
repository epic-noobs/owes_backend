import { Friend } from "../entity/Friend";
import { User } from "../entity/User";

/**
 * @description This function revokes the refresh token for user.
 * This will hep when user forgets password so that we revoke all the refresh tokens that the user has.
 * This will also help if the user is hacked and we need to revoke all the refresh tokens.
 * @param userId - The userId of the users refresh token being revoked.
 * @returns {boolean} - true if the revoking succeeded and false if the revoking did not succeed.
 */
export const revokeRefreshTokensForUser = async (userId: any) => {
  try {
    const userExist = await User.findOne({ where: { id: userId } });
    if (!userExist) {
      throw new Error("Invalid refresh.");
    }
    let id = userExist.id;
    let token = userExist.tokenVersion;
    if (!isNaN(token)) {
      let updatedToken = token + 1;
      await User.update({ id }, { tokenVersion: updatedToken });
    } else {
      throw new Error("Invalid refresh.");
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/**
 * @description - This function takes two string arguments, userId1 and userId2, representing the IDs of the two users to check. 
 * It uses Friend to create a createQueryBuilder instance for the Friend entity, 
 * constructs a query to check if the two users are friends, 
 * and returns true if they are friends (i.e. if the count of matching records is greater than 0), or false otherwise.
 * The query checks if there is a record in the friend table where either following_user is userId1 and followed_user is userId2, 
 * or vice versa, and isRequestAccepted is true. 
 * The query then returns the count of the matching records. 
 * If the count is greater than 0, the two users are friends; otherwise, they are not friends.
 * @param userId1 - first users ID.
 * @param userId2 - Second users ID.
 */
export const checkFriendship = async (userId1:string, userId2:string) => {
    try {
      const friendQueryBuilder = Friend.createQueryBuilder('friend');
      const areFriends = await friendQueryBuilder
        .where('((friend.following_user = :userId1 AND friend.followed_user = :userId2) OR (friend.following_user = :userId2 AND friend.followed_user = :userId1))', { userId1, userId2 })
        .andWhere({
          isRequestAccepted: true,
        })
        .getCount();
      return areFriends > 0;
    } catch (error) {
      console.error('Error checking if users are friends:', error.message);
      return false;
    }
}
