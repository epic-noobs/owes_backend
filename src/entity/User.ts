import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Friend } from "./Friend";

/**
 * This is the user entity.
 */
@ObjectType()
@Entity("user")
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Field()
  @Column("text")
  firstname: string;

  @Field()
  @Column("text")
  lastname: string;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column("text")
  email: string;

  @Field()
  @Column("boolean", { default: false })
  unreliable: boolean;

  @Field()
  @Column("boolean", { default: false })
  user_verified: boolean;

  /**
   * The password variable does not have the @Field() decorator because
   * we do not want the password hash to be returned when we call our endpoint.
   * So, this just makes it a column in the database.
   */
  @Column("text")
  password: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  creation_date: Date;

  @Field()
  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at: Date;

  @Column("int", { default: 0 })
  tokenVersion: number;

  @OneToMany(() => Friend, (friend) => friend.following_user_id)
  friend_following: Friend[]

  @OneToMany(() => Friend, (friend) => friend.followed_user_id)
  friend_followed: Friend[]
}
