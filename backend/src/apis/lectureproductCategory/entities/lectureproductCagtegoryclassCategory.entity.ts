import { Field, ObjectType } from '@nestjs/graphql';
import { LectureProduct } from 'src/apis/lectureProduct/entities/lectureProduct.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LectureProductCategory } from './lectureproductCategory.entity';

@Entity()
@ObjectType()
export class JoinLectureAndProductCategory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  // LectureProduct와 N:1 연결
  @JoinColumn()
  @ManyToOne(
    () => LectureProduct,
    (lectureproduct) => lectureproduct.joinproductandproductcategory,
  )
  @Field(() => LectureProduct)
  lectureproduct: LectureProduct;

  // LectureProductCategory와 N:1 연결
  @JoinColumn()
  @ManyToOne(
    () => LectureProductCategory,
    (lectureproductcategory) => lectureproductcategory.category,
  )
  @Field(() => LectureProductCategory)
  lectureproductcategory: LectureProductCategory;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;
}
