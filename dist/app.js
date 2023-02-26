"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
require("reflect-metadata");
const data_source_1 = require("./data-source");
const UserResolver_1 = require("./Resolvers/UserResolver");
const type_graphql_1 = require("type-graphql");
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const dotenv = __importStar(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const User_1 = require("./entity/User");
const auth_1 = require("./auth");
const sendRefreshToken_1 = require("./sendRefreshToken");
(async () => {
    dotenv.config();
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)());
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.sid;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }
        let payload = null;
        try {
            payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            console.log(error);
            return res.send({ ok: false, accessToken: "" });
        }
        const user = await User_1.User.findOne({ where: { id: payload.userId } });
        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }
        (0, sendRefreshToken_1.sendRefreshToken)(res, (0, auth_1.createRefreshToken)(user));
        return res.send({ ok: true, accessToken: (0, auth_1.createAccessToken)(user) });
    });
    const httpServer = http_1.default.createServer(app);
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [UserResolver_1.UserResolver],
        validate: { forbidUnknownValues: false },
    });
    const server = new server_1.ApolloServer({
        schema,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    app.use("/graphql", (0, cors_1.default)(), (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req, res }) => ({ req, res }),
    }));
    data_source_1.AppDataSource.initialize();
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
})();
//# sourceMappingURL=app.js.map