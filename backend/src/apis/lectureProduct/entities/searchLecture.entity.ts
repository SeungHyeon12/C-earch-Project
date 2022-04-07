import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class SearchLecture {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  companyName!: string;

  @Column()
  @Field(() => String)
  department!: string;

  @Column()
  @Field(() => String)
  classTitle: string;

  @Column()
  @Field(() => String)
  classDescription: string;

  @Column({ default: 0, type: 'float' })
  @Field(() => Float, { nullable: true })
  rating: number;
}
