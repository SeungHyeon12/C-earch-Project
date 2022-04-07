import { Field, ObjectType } from '@nestjs/graphql';
import { MentoInfo } from 'src/apis/user/entities/mento.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class CertificateImage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  url!: string;

  @ManyToOne(() => MentoInfo, (mento) => mento.certificate)
  @Field(() => MentoInfo)
  mento: MentoInfo;

  @DeleteDateColumn()
  @Field(() => Date)
  deleteAt: Date;
}
