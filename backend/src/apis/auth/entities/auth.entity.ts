import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AUTH_KIND {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

registerEnumType(AUTH_KIND, { name: 'AUTH_KIND' });

@Entity()
@ObjectType()
export class AuthTable {
  @PrimaryGeneratedColumn('increment')
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => String)
  indexer: string;

  @Column({ type: 'enum', enum: AUTH_KIND })
  @Field(() => AUTH_KIND)
  kind!: AUTH_KIND;

  @Column()
  @Field(() => String)
  authNumber: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;
}
