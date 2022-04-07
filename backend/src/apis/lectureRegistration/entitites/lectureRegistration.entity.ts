import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LectureOrder } from 'src/apis/lectureOrder/entities/lectureOrder.entity';
import { LectureProduct } from 'src/apis/lectureProduct/entities/lectureProduct.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JOB {
  DEFAULT = '직업선택',
  STUDENT = '학생',
  EMPLOYEED = '직장인',
  JOBSEEKER = '구직자',
  YOUNGAPPLICANT = '취업준비생',
  OWNER_FREELANCER = '창업/프리랜서',
  SELF_EMPLOYEED = '자영업자',
  ETC = '기타',
}
registerEnumType(JOB, {
  name: 'JOB',
});
@Entity()
@ObjectType()
export class LectureRegistration {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  name: string;

  @Column()
  @Field(() => String)
  phoneNumber: string;

  @Column({ type: 'enum', enum: JOB, default: JOB.DEFAULT })
  @Field(() => JOB)
  job: JOB;

  @Column()
  @Field(() => String)
  selfIntroduction: string;

  @Column()
  @Field(() => String)
  preQuestion: string;

  @Column()
  @Field(() => Int)
  age: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt?: Date;

  @ManyToOne(() => LectureProduct, (product) => product.registration)
  @Field(() => LectureProduct)
  product: LectureProduct;

  @OneToMany(() => LectureOrder, (order) => order.registration)
  @Field(() => LectureOrder, {nullable: true})
  order: LectureOrder;

  @ManyToOne(() => User, (user) => user.registration)
  @Field(() => User)
  user: User;
}
