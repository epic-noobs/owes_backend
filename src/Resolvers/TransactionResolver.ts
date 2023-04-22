import { verify } from "jsonwebtoken";
import { AppContext } from "src/AppConext";
import { Transaction } from "../entity/Transaction";
import { isAuth } from "../isAuth";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { TransactionStatus } from "../lib/constants";
import { GraphQLError } from "graphql";

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
      //check if lender and borrower is not the same person.
      if(lender ===foundUser.userId){
        throw new GraphQLError(
          "Transaction is invalid",
          {
            extensions: {
              code: "FORBIDDEN",
            },
          }
        );
      };

      //check if they are friends.
      //only send one transaction at a time.
      //This checks if there is already a transaction that was requested and is still in the pending or accepted status.
      //TODO: payed service can have more transactions.
      const result = await Transaction.createQueryBuilder("transaction")
        .where("transaction.borrower = :borrower", {
          borrower: foundUser.userId,
        })
        .andWhere({
          lender: lender  
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

  /**
   * @description - The method takes a transaction id and returns a transaction/contract.
   * @param context - The data received from the appollo context.
   * @param id {string} - The transaction id.
   * @returns {Transaction} - returns a single transaction besed on the id provided.
   */
  @Query(() => Transaction, { nullable: true })
  @UseMiddleware(isAuth)
  async getTransactionByID(@Ctx() context: AppContext, @Arg("id") id: string) {
    //Get the user token from the headers.
    const user = context.req.headers.authorization;
    //Check if user is authenticated.
    if (!user) {
      return null;
    }
    try {
      const result = await Transaction.findOne({ where: { id: id } });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * @description - The method takes a user id and return all the transactions/contracts for that user. 
   * @param context - The data received from the appollo context.
   * @returns {Transaction}- All the transaction that was requested by the user id.
   */
  @Query(() => [Transaction], { nullable: true })
  @UseMiddleware(isAuth)
  async getTransactionByUser(@Ctx() context: AppContext) {
    //Get the user token from the headers.
    const user = context.req.headers.authorization;
    //Check if user is authenticated.
    if (!user) {
      return null;
    }
    try {
      const token = user.replace("Bearer ", "");
      const foundUser = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as any;
      //TODO: Join notes and Transaction table.
      const result = await Transaction.createQueryBuilder("transaction")
      .where("transaction.borrower = :borrower", {
        borrower: foundUser.userId,
      })
      .orWhere({
        lender: foundUser.userId,
      })
      .getMany();
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  //TODO: accept or reject money request.
  @Mutation(() => Transaction, { nullable: true })
  @UseMiddleware(isAuth)
  async respond_to_transaction(
    @Arg("id") id: string,
    @Arg("answer") answer: string,
  ) {
    // TODO: Check if users have a friendship. 
    let feedback = null;
    if(answer.toLowerCase() === TransactionStatus.ACCEPTED.toLocaleLowerCase()){
      feedback = TransactionStatus.ACCEPTED;
    }else if(answer.toLowerCase() === TransactionStatus.ACCEPTED.toLocaleLowerCase()){
      feedback = TransactionStatus.REJECTED;
    }else{
      return feedback;
    }
    try{
      return await Transaction.update(
        { id: id },
        {
          transaction_status: feedback
        }
      );
    }catch(error){
      console.log(error);
      return null;
    }
  }
}
