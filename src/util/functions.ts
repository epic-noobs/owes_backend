import { User } from "src/entity/User";

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
