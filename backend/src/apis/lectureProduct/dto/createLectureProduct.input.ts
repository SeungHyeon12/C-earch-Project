import { Field, InputType, Int } from '@nestjs/graphql';
@InputType()
export class CreateLectureProductInput {
  @Field(() => String)
  classTitle!: string;

  @Field(() => [String])
  classCategories!: string[]

  @Field(() => String)
  classDescription!: string;

  @Field(() => String)
  classCurriculum: string

  @Field(() => Int)
  classPrice!: number;

  @Field(() => Int)
  classMaxUser!: number;

  @Field(() => String)
  classStartDate!: string;

  @Field(() => String)
  classStartTime!: string

  @Field(() => String)
  imageURL: string 
}
