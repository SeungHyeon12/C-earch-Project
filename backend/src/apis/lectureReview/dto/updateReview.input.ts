import { Field, InputType, PickType } from '@nestjs/graphql';
import { LectureReview } from '../entities/lectureReview.entity';

@InputType()
export class UpdateLectureReviewInput extends PickType(
  LectureReview,
  ['reviewContents', 'starRating'],
  InputType,
) {
  @Field(() => String)
  reviewId: string;
}
