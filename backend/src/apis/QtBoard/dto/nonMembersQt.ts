import { Field, InputType, PickType } from '@nestjs/graphql';
import { LectureProductCategory } from 'src/apis/lectureproductCategory/entities/lectureproductCategory.entity';
import { QtBoard } from '../entities/qt.entity';

// @InputType()
// export class QtTagsInput {
//   @Field(() => [LectureProductCategory])
//   qtTag: [LectureProductCategory];
// }

@InputType()
export class NonMembersQtInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  contents!: string;

  @Field(() => String)
  password: string;

  @Field(() => [String])
  qtTags?: string[];
}
