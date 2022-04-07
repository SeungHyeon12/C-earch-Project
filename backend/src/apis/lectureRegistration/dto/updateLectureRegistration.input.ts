import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateLectureRegistrationInput {
  @Field(() => Int, {nullable: true})
  age: number

  @Field(() => String, {nullable: true})
  phoneNumber: string

  @Field(() => String, {nullable: true})
  selfIntroduction: string;

  @Field(() => String, {nullable: true})
  preQuestion: string;
}

