import { UseGuards, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';

import { Role } from 'src/common/auth/decorate/role.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { RoleGuard } from 'src/common/auth/guard/roleGuard';
import { IcurrentUser } from '../auth/auth.resolver';

import { USER_ROLE } from '../user/entities/user.entity';
import { CreateLectureProductInput } from './dto/createLectureProduct.input';
import { LectureProduct } from './entities/lectureProduct.entity';
import { LectureProductService } from './lectureProduct.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchLecture } from './entities/searchLecture.entity';
import { Cache } from 'cache-manager';

@Resolver()
export class LectureProductResolver {
  constructor(
    private readonly lectureProductService: LectureProductService,
    private readonly elasticsearchService: ElasticsearchService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // Find Popular Classes
  @Query(() => [LectureProduct])
  async fetchPopularClass() {
    return await this.lectureProductService.findPopular();
  }

  @Query(() => [SearchLecture])
  async fetchSearchAuto(@Args('search') search: string) {
    const searchCache = await this.cacheManager.get(`lecture:${search}`);
    if (searchCache) return searchCache;
    else {
      const result = await this.elasticsearchService.search({
        index: 'lecture',
        from: 0,
        size: 100,
        query: {
          bool: {
            should: [
              { prefix: { classtitle: search } },
              { prefix: { classdescription: search } },
              { prefix: { name: search } },
            ],
          },
        },
      });
      const resultarray = result.hits.hits.map((ele: any) => ({
        id: ele._source.id,
        companyName: ele._source.companyname,
        department: ele._source.department,
        name: ele._source.name,
        classTitle: ele._source.classtitle,
        classDescription: ele._source.classdescription,
        rating: ele._source.rating,
      }));
      console.log(resultarray);
      await this.cacheManager.set(`lecture:${search}`, resultarray, {
        ttl: 600,
      });
      return resultarray;
    }
  }

  @Mutation(() => LectureProduct)
  @UseGuards(GqlAccessGuard)
  @Role(USER_ROLE.MENTOR)
  async createLectureProduct(
    @Args('createLectureProductInput')
    createLectureProductInput: CreateLectureProductInput,
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.lectureProductService.create({
      user: currentUser,
      createLectureProductInput,
    });
  }

  @Query(() => [LectureProduct])
  async fetchlectureProducts(@Args('page') page: number) {
    return await this.lectureProductService.findAll();
  }

  @Query(() => LectureProduct)
  async fetchLectureProduct(
    @Args('lectureproductId') lectureproductId: string, //
    @Args('page') page: number,
  ) {
    return await this.lectureProductService.findOne({ lectureproductId, page });
  }

  @Query(() => [LectureProduct])
  async fetchNewClasses() {
    return await this.lectureProductService.findNewClasses();
  }

  @Query(() => [LectureProduct])
  async fetchSelectedTagLectures(
    @Args('lectureproductcategoryname') lectureproductcategoryname: string,
    @Args('page') page: number,
  ) {
    return await this.lectureProductService.fetchSelectedTagLectures({
      lectureproductcategoryname,
      page,
    });
  }

  @Query(() => [LectureProduct])
  @UseGuards(GqlAccessGuard, RoleGuard)
  @Role(USER_ROLE.MENTOR)
  async fetchLectureWithMentor(@CurrentUser() currentuser: IcurrentUser) {
    return await this.lectureProductService.findLectureWithMentor({
      currentuser,
    });
  }

  @Query(() => [LectureProduct])
  @UseGuards(GqlAccessGuard)
  async fetchLectureWithMentee(@CurrentUser() currentuser: IcurrentUser) {
    return await this.lectureProductService.findLectureWithMentee({
      currentuser,
    });
  }

  @Mutation(() => LectureProduct)
  @UseGuards(GqlAccessGuard)
  async updateLectureProduct(
    @Args('lectureproductId') lectureproductId: string,
    createLectureProductInput,
  ) {
    return await this.lectureProductService.update({
      lectureproductId,
      createLectureProductInput,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAccessGuard, RoleGuard)
  @Role(USER_ROLE.MENTOR)
  async deleteLectureProduct(
    @Args('lectureproductId') lectureproductId: string,
  ) {
    return await this.lectureProductService.delete({ lectureproductId });
  }

  @Query(() => LectureProduct)
  async fetchLectureDetail(@Args('lectureId') lectureId: string) {
    return await this.lectureProductService.fetchLectureDetail({ lectureId });
  }
}
