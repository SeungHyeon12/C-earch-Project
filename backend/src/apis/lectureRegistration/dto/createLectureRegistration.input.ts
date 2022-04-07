import { Field, InputType, Int } from '@nestjs/graphql';
import { JOB } from '../entitites/lectureRegistration.entity';

@InputType()
export class CreateLectureRegistrationInput {
  @Field(() => String, {nullable: true})
  name: string

  @Field(() => String)
  phoneNumber: string

  @Field(() => JOB)
  job: JOB

  @Field(() => String)
  selfIntroduction: string;

  @Field(() => String)
  preQuestion: string;

  @Field(() => Int)
  age: number
}
