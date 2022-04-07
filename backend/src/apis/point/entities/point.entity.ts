import { ObjectType, Field, registerEnumType, Int } from '@nestjs/graphql';
import { User } from 'src/apis/user/entities/user.entity';
import { Wallet } from 'src/apis/wallet/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum POINT_STATUS_ENUM {
  PAYMENT = 'PAYMENT',
  CANCEL = 'CANCEL',
}

registerEnumType(POINT_STATUS_ENUM, {
  name: 'POINT_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Point {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  impUid: string;

  @Column()
  @Field(() => Int)
  amount: number;

  @Column({ type: 'enum', enum: POINT_STATUS_ENUM, nullable: true })
  @Field(() => POINT_STATUS_ENUM)
  status: POINT_STATUS_ENUM;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @JoinColumn()
  @OneToOne(() => Wallet, (wallet) => wallet.payment)
  @Field(() => Wallet)
  wallet: Wallet;
}
