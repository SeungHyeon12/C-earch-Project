import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  ICurrentUser,
} from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { CreateLectureReviewInput } from './dto/createReview.input';
import { UpdateLectureReviewInput } from './dto/updateReview.input';
import { LectureReview } from './entities/lectureReview.entity';
import { LectureReviewService } from './lectureReview.service';


@Resolver()
export class LectureReviewResolver {
  constructor(private readonly lectureReviewService: LectureReviewService) {}

  @Query(() => [LectureReview])
  async fetchLectureReviews(@Args('lectureId') lectureId: string) {
    return await this.lectureReviewService.findLectureReviews({
      lectureId,
    });
  }
  @Query(() => [LectureReview])
  async fetchReviewCount(@Args('lectureId') lectureId: string) {
    return await this.lectureReviewService.findReviewCount({
      lectureId,
    });
  }

  @UseGuards(GqlAccessGuard)
  @Query(() => LectureReview)
  async fetchLectureReview(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('lectureId') lectureId: string,
  ) {
    return await this.lectureReviewService.findOne({
      currentuser,
      lectureId,
    });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => LectureReview)
  async createLectureReview(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('createReviewInput') createReviewInput: CreateLectureReviewInput,
  ) {
    return await this.lectureReviewService.create({
      currentuser,
      createReviewInput,
    });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => LectureReview)
  async updateLectureReview(
    @Args('updateReviewInput') updateReviewInput: UpdateLectureReviewInput,
    @CurrentUser() currentuser: ICurrentUser,
  ) {
    return await this.lectureReviewService.update({
      updateReviewInput,
      currentuser,
    });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Boolean)
  async deleteLectureReview(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('reviewId') reviewId: string,
  ) {
    return await this.lectureReviewService.delete({ currentuser, reviewId });
  }
}
