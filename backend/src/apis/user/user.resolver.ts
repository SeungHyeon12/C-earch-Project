import {
  UseGuards,
  CACHE_MANAGER,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Args, Mutation, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';
import { Role } from 'src/common/auth/decorate/role.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { IcurrentUser } from '../auth/auth.resolver';
import { AuthService } from '../auth/auth.service';
import { AUTH_KIND } from '../auth/entities/auth.entity';
import { MentorForm } from './dto/mentoForm.input';
import { UserForm } from './dto/user.input';
import { Cache } from 'cache-manager';
import { MentoInfo } from './entities/mento.entity';
import { User, USER_ROLE } from './entities/user.entity';
import { UserService } from './user.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchMento } from './entities/searchMento.entity';
import { UpdateUserForm } from './dto/updateUser.input';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
    private readonly elasticsearchService: ElasticsearchService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Query(() => Int)
  async fetchNewUserCount(@Args('date') date: string) {
    return await this.userService.findSignInCount({ date });
  }

  @Query(() => Int)
  async fetchAllMentorCount() {
    return await this.userService.findMentorCount();
  }

  @Query(() => [SearchMento])
  async fetchHomeSearch(@Args('search') search: string) {
    if (search.length < 2)
      throw new UnprocessableEntityException('두 글자 이상 입력해주세요');

    const searchCache = await this.cacheManager.get(`mentor:${search}`);
    if (searchCache) return searchCache;
    else {
      const result = await this.elasticsearchService.search({
        index: 'mentor', // 테이블명
        sort: ['_score'],
        from: 0,
        size: 100,
        query: {
          bool: {
            must: [
              { match: { name: search } },
              { match: { role: 'MENTOR' } },
              { match: { mentostatus: 'AUTHORIZED' } },
            ],
          },
        },
      });
      const resultarray = result.hits.hits.map((ele: any) => ({
        id: ele._source.id,
        companyName: ele._source.companyname,
        department: ele._source.department,
        name: ele._source.name,
        selfIntro: ele._source.selfintro,
      }));
      console.log(resultarray);
      await this.cacheManager.set(`mentor:${search}`, resultarray, {
        ttl: 600,
      });
      if (!resultarray)
        throw new UnprocessableEntityException('검색결과가 없습니다.');
      return resultarray;
    }
  }

  @Query(() => User)
  @UseGuards(GqlAccessGuard)
  @Role(USER_ROLE.MENTOR)
  async fetchMentorUser(@CurrentUser() currentUser: IcurrentUser) {
    return await this.userService.findMentoPage({ currentUser });
  }

  @Query(() => User)
  @UseGuards(GqlAccessGuard)
  async fetchUser(@CurrentUser() currentUser: IcurrentUser) {
    return await this.userService.findMyPage({ currentUser });
  }

  @Query(() => Boolean)
  async isCheckEmail(
    @Args('email') email: string, //
  ) {
    return await this.userService.isCheckEmail({ email });
  }

  @Query(() => Boolean)
  async phoneCheckToken(
    @Args('phoneNumber') phoneNumber: string,
    @Args('inputToken') inputToken: string,
  ) {
    return await this.authService.checkToken({
      indexer: phoneNumber,
      inputToken,
      kind: AUTH_KIND.PHONE,
    });
  }

  @Query(() => Boolean)
  async emailCheckToken(
    @Args('email') email: string,
    @Args('inputToken') inputToken: string, //
  ) {
    return await this.authService.checkToken({
      indexer: email,
      kind: AUTH_KIND.EMAIL,
      inputToken,
    });
  }

  @Mutation(() => User)
  async createUser(
    @Args('userForm') userForm: UserForm, //
  ) {
    return await this.userService.saveForm({ userForm });
  }

  @Mutation(() => String)
  async sendPhoneNumber(
    @Args('phoneNumber') phoneNumber: string, //
  ) {
    const authNumber = await this.authService.makeToken({
      indexer: phoneNumber,
      kind: AUTH_KIND.PHONE,
    });
    const result = await this.authService.sendTokenPhone({
      phoneNumber,
      authNumber,
    });
    return result;
  }

  @Mutation(() => String)
  async sendEmailToken(
    @Args('email') email: string, //
  ) {
    const authNumber = await this.authService.makeToken({
      indexer: email,
      kind: AUTH_KIND.EMAIL,
    });
    const result = await this.authService.sendTokenEmail({ email, authNumber });
    return result;
  }

  @Mutation(() => User)
  async updatePassword(
    @Args('email') email: string,
    @Args('newPassword') newPassword: string, //
  ) {
    return await this.userService.updatePassword({ email, newPassword });
  }

  @Mutation(() => User)
  async authMentor(@Args('userId') userId: string) {
    return await this.userService.promoteMento({ userId });
  }

  @Mutation(() => MentoInfo)
  @UseGuards(GqlAccessGuard)
  async sendMentorForm(
    @Args('mentorForm') mentorForm: MentorForm, //
    @Args({ name: 'category', type: () => [String] }) category: string[],
    @CurrentUser()
    currentUser: IcurrentUser,
  ) {
    return await this.userService.sendMentorForm({
      mentorForm,
      user: currentUser,
      category,
    });
  }

  @Query(() => [MentoInfo])
  async fetchMentor(
    @Args('page') page: number, //
  ) {
    return await this.userService.fetchMentor({ page });
  }

  @Query(() => [MentoInfo])
  async fetchSelectedTagMentor(
    @Args('page') page: number, //
    @Args('categoryName') categoryName: string,
  ) {
    return await this.userService.fetchMentorWithCategory({
      page,
      categoryName,
    });
  }

  @Query(() => [MentoInfo])
  async fetchAuthorMentor() {
    return await this.userService.fetchAuthorMentor();
  }

  @Mutation(() => MentoInfo)
  @UseGuards(GqlAccessGuard)
  async updateMentorInfo(
    @Args('mentorForm') mentorForm: MentorForm,
    @Args({ name: 'category', type: () => [String] }) category: string[],
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.userService.updateMentoForm({
      user: currentUser,
      mentorForm,
      category,
    });
  }

  @Mutation(() => User)
  @UseGuards(GqlAccessGuard)
  async updateUserInfo(
    @Args('updateUserForm') updateUserForm: UpdateUserForm,
    @Args({ name: 'category', type: () => [String] }) category: string[],
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.userService.updateUserForm({
      user: currentUser,
      category,
      updateUserForm,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAccessGuard)
  @Role(USER_ROLE.ADMIN)
  async authMentorLecture(
    @CurrentUser() currentUser: IcurrentUser,
    @Args('mentorId') mentorId: string,
    @Args('lectureId') lectureId: string,
  ) {
    return await this.userService.permitLecture({
      currentUser,
      mentorId,
      lectureId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAccessGuard)
  @Role(USER_ROLE.ADMIN)
  async deleteUser(
    @CurrentUser() currentUser: IcurrentUser,
    @Args('userId') userId: string,
  ) {
    return await this.userService.delete({
      currentUser,
      userId,
    });
  }
}
