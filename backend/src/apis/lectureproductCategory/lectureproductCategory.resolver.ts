import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LectureProductCategory } from './entities/lectureproductCategory.entity';
import { LectureProductCategoryService } from './lectureproductCategory.service';

@Resolver()
export class LectureProductCategoryResolver {
  constructor(
    private readonly lectureproductCategoryService: LectureProductCategoryService,
  ) {}

  @Mutation(() => LectureProductCategory)
  async createlectureproductCategory(
    @Args('categoryname') categoryname: string,
  ) {
    return await this.lectureproductCategoryService.create({
      categoryname,
    });
  }

  @Query(() => [LectureProductCategory])
  async fetchlectureproductCategories() {
    return await this.lectureproductCategoryService.findAll();
  }

  @Query(() => LectureProductCategory)
  async fetchLectureProduct(
    @Args('lectureproductCategoryId') lectureproductCategoryId: string,
  ) {
    return await this.lectureproductCategoryService.findOne({
      lectureproductCategoryId,
    });
  }

  @Mutation(() => Boolean)
  async deletelectureproductCategory(
    @Args('lectureproductCategoryId') lectureproductCategoryId: string,
  ) {
    return await this.lectureproductCategoryService.delete({
      lectureproductCategoryId,
    });
  }
}
