import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

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
  user_name: string;

  @Field()
  @Column("text")
  email: string;

  @Field()
  @Column("text")
  unreliable: boolean = false;

  @Field()
  @Column("boolean", {default:false})
  user_verified: boolean;

  /**
   * The password variable does not have the @Field() decorator because
   * we do not want the password hash to be returned when we call our endpoint.
   * So, this just makes it a column in the database.
   */
  @Column("text")
  password: string;

  @Field()
  @CreateDateColumn()
  creation_date: Date;

  @Field()
  @Column()
  created_at: string;
}
