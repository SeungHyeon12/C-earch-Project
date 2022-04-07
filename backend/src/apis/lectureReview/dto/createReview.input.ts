import { Field, InputType, PickType } from '@nestjs/graphql';
import { LectureReview } from '../entities/lectureReview.entity';

@InputType()
export class CreateLectureReviewInput extends PickType(
  LectureReview,
  ['reviewContents', 'starRating'],
  InputType,
) {
  @Field(() => String)
  lectureProductId: string;
}
