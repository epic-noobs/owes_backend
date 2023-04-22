import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { User } from "../entity/User";


/**
 * This is the friend entity.
 */
@ObjectType()
@Entity("friend")
export class Friend extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

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

  @Field()
  @Column({
	nullable:false,
	default: false
  })
  isRequestAccepted: boolean

  @ManyToOne(() => User, (following_user) => following_user.friend_followed)
  @Field(() => [String])
  @JoinColumn()
  following_user:string

  @ManyToOne(() => User, (followed_user) => followed_user.friend_following)
  @Field(() => [String])
  @JoinColumn()
  followed_user:string
}
