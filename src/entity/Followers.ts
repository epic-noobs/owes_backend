import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

/**
 * This is the follower entity.
 */
@ObjectType()
@Entity("user")
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Field()
  @Column("text")
  following_user: string;

  @Field()
  @Column("text")
  followed_user: string;

  @Field()
  @CreateDateColumn()
  creation_date: Date;

  @Field()
  @Column()
  created_at: string;
}
