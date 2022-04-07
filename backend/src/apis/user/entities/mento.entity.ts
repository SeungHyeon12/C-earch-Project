import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CertificateImage } from 'src/apis/certificateImage/entities/certificate.entity';
import { LectureProduct } from 'src/apis/lectureProduct/entities/lectureProduct.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { JoinMentoAndProductCategory } from './workMento.entity';

export enum MENTOR_AUTH {
  PENDING = 'PENDING',
  AUTHROIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
}
registerEnumType(MENTOR_AUTH, { name: 'MENTOR_AUTH' });

@Entity()
@ObjectType()
export class MentoInfo {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ nullable: true })
  @Field(() => String)
  companyName!: string;

  @Column({ nullable: true })
  @Field(() => String)
  department!: string;

  @Column({ default: MENTOR_AUTH.PENDING })
  @Field(() => MENTOR_AUTH, { defaultValue: MENTOR_AUTH.PENDING })
  mentoStatus: MENTOR_AUTH;

  @Column({ nullable: true })
  @Field(() => String)
  selfIntro!: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @OneToMany(() => CertificateImage, (certificate) => certificate.mento)
  @Field(() => [CertificateImage])
  certificate: CertificateImage[];

  @OneToMany(
    () => JoinMentoAndProductCategory,
    (joinMentoAndProductCategory) => joinMentoAndProductCategory.mento,
  )
  @Field(() => [JoinMentoAndProductCategory])
  work: JoinMentoAndProductCategory[];

  @OneToOne(() => User, (user) => user.mentor)
  @Field(() => User)
  user: User;

  @Column({ nullable: true })
  @Field(() => String)
  onlineTime: string;

  @OneToMany(() => LectureProduct, (lecutre) => lecutre.mentor)
  @Field(() => [LectureProduct])
  lecture: LectureProduct[];

  @Column({ default: 0 })
  @Field(() => Int)
  follower: number;
}
