"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entity/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
let UserResolver = class UserResolver {
    async testQuery({ req }) {
        console.log("testing");
        return req;
    }
    async createUser(email, password, firstname, lastname, username) {
        const userExist = await User_1.User.findOne({ where: { email: email } });
        if (!userExist) {
            let strongPassword = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})");
            let strongEmail = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
            if (!strongEmail.test(email)) {
                throw new Error("Not a valid email");
            }
            if (!strongPassword.test(password)) {
                throw new Error("You are not authorized to perform this action.");
            }
            try {
                const hashedPassword = await argon2_1.default.hash(password);
                await User_1.User.insert({
                    email,
                    password: hashedPassword,
                    firstname,
                    lastname,
                    username,
                });
                return true;
            }
            catch (error) {
                console.log("Error: ", error);
                throw new Error(error);
            }
        }
        else {
            console.log("User already exist.");
            throw new Error("User already exist.");
        }
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "testQuery", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Arg)("firstname")),
    __param(3, (0, type_graphql_1.Arg)("lastname")),
    __param(4, (0, type_graphql_1.Arg)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map