import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Comments } from 'src/apis/comments/entities/comments.entity';
import { LectureRegistration } from 'src/apis/lectureRegistration/entitites/lectureRegistration.entity';
import { LectureReview } from 'src/apis/lectureReview/entities/lectureReview.entity';
import { Likes } from 'src/apis/likes/entities/likes.entity';
import { QtBoard } from 'src/apis/QtBoard/entities/qt.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JoinUserAndProductCategory } from './interestUser.entity';
import { MentoInfo } from './mento.entity';

export enum USER_ROLE {
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
  ADMIN = 'ADMIN',
}

registerEnumType(USER_ROLE, {
  name: 'USER_ROLE',
});

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  gender: string;

  @Column()
  password: string;

  @Column()
  @Field(() => String)
  phoneNumber!: string;

  @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.MENTEE }) //role type 추가
  @Field(() => USER_ROLE)
  role!: USER_ROLE;

  @Column('int', { default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  point: number;

  @Column('int', { default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  following: number;

  @Column('int', { default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  answerCount: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deleteDate: Date;

  @OneToMany(() => QtBoard, (qt) => qt.user, {})
  @Field(() => [QtBoard])
  qtBoard: QtBoard[];

  @OneToMany(() => Comments, (comment) => comment.user)
  @Field(() => [Comments])
  comments: Comments[];

  @JoinColumn()
  @OneToOne(() => MentoInfo, (mentoInfo) => mentoInfo.user)
  @Field(() => MentoInfo)
  mentor: MentoInfo;

  @OneToMany(() => Likes, (like) => like.user)
  @Field(() => [Likes])
  likes: Likes[];

  @OneToMany(() => LectureReview, (review) => review.user)
  @Field(() => [LectureReview])
  reviews: LectureReview[];

  @OneToMany(
    () => JoinUserAndProductCategory,
    (joinUserAndProductCategory) => joinUserAndProductCategory.user,
    { nullable: true },
  )
  @Field(() => [JoinUserAndProductCategory], { nullable: true })
  interest: JoinUserAndProductCategory[];

  @OneToMany(() => LectureRegistration, (registration) => registration.user)
  @Field(() => [LectureRegistration])
  registration: LectureRegistration[];
}
