import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QtBoard } from './qt.entity';

@Entity()
@ObjectType()
export class JoinQtBoardAndProductCategory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  tagname: string;

  @ManyToOne(() => QtBoard, (board) => board.qtTags)
  @Field(() => QtBoard)
  qtBoard: QtBoard;

  @DeleteDateColumn({ nullable: true })
  @Field(() => Date, { nullable: true })
  deleteAt: Date;
}
