"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshTokensForUser = void 0;
const User_1 = require("src/entity/User");
const revokeRefreshTokensForUser = async (userId) => {
    try {
        const userExist = await User_1.User.findOne({ where: { id: userId } });
        if (!userExist) {
            throw new Error("Invalid refresh.");
        }
        let id = userExist.id;
        let token = userExist.tokenVersion;
        if (!isNaN(token)) {
            let updatedToken = token + 1;
            await User_1.User.update({ id }, { tokenVersion: updatedToken });
        }
        else {
            throw new Error("Invalid refresh.");
        }
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.revokeRefreshTokensForUser = revokeRefreshTokensForUser;
//# sourceMappingURL=functions.js.map