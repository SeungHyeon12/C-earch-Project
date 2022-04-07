import { Field, ObjectType } from '@nestjs/graphql';
import { LectureProductCategory } from 'src/apis/lectureproductCategory/entities/lectureproductCategory.entity';
import {
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MentoInfo } from './mento.entity';

@Entity()
@ObjectType()
export class JoinMentoAndProductCategory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  // LectureProductCategory와 N:1 연결
  @ManyToOne(
    () => LectureProductCategory,
    (linkedToLectureProductCategory) => linkedToLectureProductCategory.category,
  )
  @Field(() => LectureProductCategory)
  category: LectureProductCategory;

  // LectureProduct와 N:1 연결
  @ManyToOne(() => MentoInfo, (mento) => mento.work)
  @Field(() => MentoInfo)
  mento: MentoInfo;

  @DeleteDateColumn()
  @Field(() => Date)
  deleteAt: Date;
}
