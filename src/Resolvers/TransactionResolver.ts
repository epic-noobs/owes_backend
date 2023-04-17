import { verify } from "jsonwebtoken";
import { AppContext } from "src/AppConext";
import { Transaction } from "../entity/Transaction";
// import { User } from "../entity/User";
import { isAuth } from "../isAuth";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { TransactionStatus } from "../lib/constants";
import { GraphQLError } from "graphql";
// import { GraphQLError } from "graphql";

@Resolver(Transaction)
export class TransactionResolver {

  /**
   * This function sends a request to another user to accept the
   * @param amount - {string} amount of money provided by the person asking for money.
   * @param created_at - {string} the location the request was sent from.
   * @param lender  - {string} the userID of the persong being asked for the money.
   */
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async sendTransactionRequest(
    @Ctx() context: AppContext,
    @Arg("amount") amount: number,
    @Arg("created_at") created_at: string,
    @Arg("lender") lender: string
  ) {
    //Get the user token from the headers.
    const user = context.req.headers.authorization;
    try {
      const token = user?.replace("Bearer ", "");
      const foundUser = verify(
        token as string,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as any;
      //check if they are friends
      //only send one transaction at a time.
      //This checks if there is already a transaction that was requested and is still in the pending or accepted status.
      //TODO: payed service can have more transactions.
      const result = await Transaction.createQueryBuilder("transaction")
        .where("transaction.borrower = :borrower", {
          borrower: foundUser.userId,
        })
        .andWhere({
          transaction_status: TransactionStatus.PENDING,
        })
        .orWhere({
          transaction_status: TransactionStatus.ACCEPTED,
        })
        .getOne();
      if (
        result?.transaction_status === TransactionStatus.PENDING ||
        result?.transaction_status === TransactionStatus.ACCEPTED
      ) {
        throw new GraphQLError(
          "Transaction already exist, please settle the transaction before sending another request.",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          }
        );
      }
      await Transaction.insert({
        amount: amount,
        created_at: created_at,
        borrower: foundUser.userId, // The person asking for the mponey.
        lender: lender, // The person being asked for the money.
      });
      return true;
    } catch (error) {
      return error;
    }
  }
  //get the transaction by ID.
  //get transactions based on user.
  //accept or reject money request.
}
