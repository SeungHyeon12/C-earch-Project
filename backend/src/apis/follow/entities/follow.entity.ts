import { Field, ObjectType } from '@nestjs/graphql';
import { MentoInfo } from 'src/apis/user/entities/mento.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User)
  follower: User;

  @Field(() => MentoInfo)
  @ManyToOne(() => MentoInfo)
  followee: MentoInfo;

  @Field(() => Boolean)
  @Column({ nullable: true })
  following: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
