import { Field, ObjectType } from '@nestjs/graphql';
import { QtBoard } from 'src/apis/QtBoard/entities/qt.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  url!: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;

  @ManyToOne(() => QtBoard)
  qtBoard: QtBoard;
}
