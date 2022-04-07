import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  CurrentUser,
  ICurrentUser,
} from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { Likes } from './entities/likes.entity';
import { LikesService } from './likes.service';

@Resolver()
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Likes)
  async updateQtLike(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('postId') postId: string,
  ) {
    return await this.likesService.likes({ currentuser, postId });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Boolean)
  async isLike(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('postId') postId: string,
  ) {
    return await this.likesService.islike({ currentuser, postId });
  }
}
