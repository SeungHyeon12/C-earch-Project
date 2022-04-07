import { Field, ObjectType } from '@nestjs/graphql';
import { LectureProduct } from 'src/apis/lectureProduct/entities/lectureProduct.entity';
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
export class LectureImage {
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

  @ManyToOne(() => LectureProduct, (product) => product.image)
  @Field(() => LectureProduct)
  product: LectureProduct;
}
