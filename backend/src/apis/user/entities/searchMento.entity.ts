import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class SearchMento {
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
  selfIntro!: string;
}
