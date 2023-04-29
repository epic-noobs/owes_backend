import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Transaction } from "./Transaction";

/**
 * This is the user entity.
 */
@ObjectType()
@Entity("notes")
export class Notes extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("text")
  note: string; //The person asking_for_money.

  @OneToOne(() => Transaction, (transaction) => transaction.notes)
  @JoinColumn()
  transaction: Transaction; //The person asking_for_money.

}
