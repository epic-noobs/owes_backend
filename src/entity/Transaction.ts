import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Notes } from "./Notes";
import { TransactionStatus } from "../lib/constants";
import { Max } from "class-validator"

/**
 * This is the transaction/contract entity.
 */
@ObjectType()
@Entity("transaction")
export class Transaction extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  contract_date: Date;

  @Field()
  @Column("text")
  created_at: string; 
  
  @Field()
  @Column("text", { default: TransactionStatus.PENDING })
  transaction_status: string;

  @Field()
  @Column("int")
  amount: number;

  @Column("int",  { default: 0 })
  @Max(2)
  settled_counter: number;

  @OneToMany(() => Notes, (notes) => notes.transaction)
  notes: Notes[];

  @ManyToOne(() => User, (lender) => lender.lender)
  @Field(() => [String])
  @JoinColumn()
  lender: string;  //The person giving the money.

  @ManyToOne(() => User, (borrower) => borrower.borrower)
  @Field(() => [String])
  @JoinColumn()
  borrower: User; //The person asking_for_money.

}
