import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Transaction } from "./Transaction";

/**
 * This is the user entity.
 */
@ObjectType()
@Entity("notes")
export class Notes extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Field()
  @Column("text")
  note: string; //The person asking_for_money.

  @ManyToOne(() => Transaction, (transaction) => transaction.notes)
  @Field(() => [String])
  @JoinColumn()
  transaction: Transaction; //The person asking_for_money.

}
