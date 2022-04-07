import { Field, ObjectType } from '@nestjs/graphql';
import { QtBoard } from 'src/apis/QtBoard/entities/qt.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Likes {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => Boolean)
  isLike: boolean;

  @ManyToOne(() => QtBoard, (qtBoard) => qtBoard.likes)
  @Field(() => QtBoard)
  qtBoard: QtBoard;

  @ManyToOne(() => User, (user) => user.likes)
  @Field(() => User)
  user: User;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;
}
