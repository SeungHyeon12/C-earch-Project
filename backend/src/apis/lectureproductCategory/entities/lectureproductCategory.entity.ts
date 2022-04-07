/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, ObjectType } from '@nestjs/graphql';
import { JoinUserAndProductCategory } from 'src/apis/user/entities/interestUser.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinLectureAndProductCategory } from './lectureproductCagtegoryclassCategory.entity';

@Entity()
@ObjectType()
export class LectureProductCategory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  categoryname: string;

  // JoinLectureAndProductCategory와 1:N 연결
  @JoinColumn()
  @OneToMany(
    () => JoinLectureAndProductCategory,
    (category) => category.lectureproductcategory,
  )
  @Field(() => [JoinLectureAndProductCategory], { nullable: true })
  category: JoinLectureAndProductCategory[];

  @JoinColumn()
  @OneToMany(
    () => JoinUserAndProductCategory,
    (category) => category.linkedToLectureProductCategory,
    { nullable: true },
  )
  @Field(() => [JoinUserAndProductCategory], { nullable: true })
  interest: JoinUserAndProductCategory[];
}
