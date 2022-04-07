import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  CurrentUser,
  ICurrentUser,
} from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { CommentsService } from './comments.service';
import { Comments } from './entities/comments.entity';

@Resolver()
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(GqlAccessGuard)
  @Query(() => [Comments])
  async fetchMyComments(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('page') page: number,
  ) {
    return await this.commentsService.findMyComments({ currentuser, page });
  }

  @Query(() => [Comments])
  async fetchComments(
    @Args('postId') postId: string,
    @Args('page') page: number,
  ) {
    return await this.commentsService.findOne({ postId, page });
  }

  @Query(() => [Comments])
  async fetchReComments(
    @Args('commentId') commentId: string,
    @Args('page') page: number,
  ) {
    return await this.commentsService.findAllReComment({ commentId, page });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Comments)
  async createComments(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('contents') contents: string,
    @Args('postId') postId: string,
  ) {
    return await this.commentsService.create({ currentuser, postId, contents });
  }

  @Mutation(() => Comments)
  @UseGuards(GqlAccessGuard)
  async updateComments(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('contents') acontents: string,
    @Args('commentId') commentId: string,
  ) {
    return await this.commentsService.update({
      currentuser,
      commentId,
      acontents,
    });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Boolean)
  async deleteComments(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('commentId') commentId: string,
  ) {
    return await this.commentsService.delete({ currentuser, commentId });
  }
  @UseGuards(GqlAccessGuard)
  @Mutation(() => Comments)
  async selectBestComments(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('commentId') commentId: string,
  ) {
    return await this.commentsService.select({ currentuser, commentId });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Comments)
  async createReply(
    @CurrentUser() currentuser: ICurrentUser,
    @Args('contents') contents: string,
    @Args('commentId') commentId: string,
  ) {
    return await this.commentsService.createReply({
      currentuser,
      commentId,
      contents,
    });
  }
}
