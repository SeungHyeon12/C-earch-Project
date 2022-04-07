import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QtBoard } from 'src/apis/QtBoard/entities/qt.entity';
import { User } from 'src/apis/user/entities/user.entity';
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
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column({ type: 'longtext' })
  @Field(() => String)
  contents!: string;

  @Column({
    default: 0,
  })
  @Field(() => Int, { nullable: true })
  isPick!: number;

  @Column({ default: 0, nullable: true })
  @Field(() => Int, { nullable: true })
  depth!: number;

  @Column({ nullable: true, default: '1' })
  @Field(() => String, { nullable: true })
  parent: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  group: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;

  @ManyToOne(() => QtBoard, (qtBoard) => qtBoard.comments, {
    nullable: true,
  })
  @Field(() => QtBoard)
  qtBoard: QtBoard;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Field(() => User)
  user: User;
}
