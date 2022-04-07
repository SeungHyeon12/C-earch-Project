import { Field, Float, ObjectType } from '@nestjs/graphql';
import { LectureProduct } from 'src/apis/lectureProduct/entities/lectureProduct.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

type Rating = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

@Entity()
@ObjectType()
export class LectureReview {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  reviewContents: string;

  @Column()
  @Field(() => Float)
  starRating: Rating;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Field(() => User)
  user: User;

  @ManyToOne(() => LectureProduct, (lecture) => lecture.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Field(() => LectureProduct)
  lecture: LectureProduct;
}
