import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { IcurrentUser } from '../auth/auth.resolver';
import { MentoInfo } from '../user/entities/mento.entity';
import { Follow } from './entities/follow.entity';
import { FollowService } from './follow.service';

@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  @Mutation(() => Follow)
  @UseGuards(GqlAccessGuard)
  async followToggle(
    @Args('mentoId') mentoId: string, //
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    const result = await this.followService.followToggle({
      mentoId,
      user: currentUser,
    });
    return result;
  }

  @Query(() => [MentoInfo])
  async fetchMostRecommendMentor() {
    return await this.followService.fetchMostRecommendMentor();
  }

  @Query(() => [MentoInfo])
  async fetchMostAnswerMentor() {
    return await this.followService.fetchMostAnswerMentor();
  }

  @Query(() => [Follow])
  @UseGuards(GqlAccessGuard)
  async fetchMyFollower(
    @CurrentUser() currentUser: IcurrentUser, //
  ) {
    return await this.followService.fetchMyFollower({ userId: currentUser.id });
  }
}
