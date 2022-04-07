import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Point } from 'src/apis/point/entities/point.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  division!: string;

  @Column()
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => Int)
  point: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @OneToOne(() => Point, (point) => point.wallet)
  @Field(() => Point)
  payment: Point;
}
