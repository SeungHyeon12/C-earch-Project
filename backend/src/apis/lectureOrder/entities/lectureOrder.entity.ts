import { Field, ObjectType } from '@nestjs/graphql';
import { LectureRegistration } from 'src/apis/lectureRegistration/entitites/lectureRegistration.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum REGISTRATION_STATUS_ENUM {
  DEFAULT = 'DEFAULT',
  READY = 'READY',
  PAID = 'PAID',
  CANCEL = 'CANCEL',
}

@Entity()
@ObjectType()
export class LectureOrder {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @Column({
    type: 'enum',
    enum: REGISTRATION_STATUS_ENUM,
    default: REGISTRATION_STATUS_ENUM.DEFAULT,
  })
  @Field(() => String, { nullable: true })
  registrationStatus!: string;

  @ManyToOne(() => LectureRegistration, (registration) => registration.order)
  @Field(() => LectureRegistration)
  registration: LectureRegistration;
}
