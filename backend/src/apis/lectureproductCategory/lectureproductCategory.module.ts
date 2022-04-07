import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinLectureAndProductCategory } from './entities/lectureproductCagtegoryclassCategory.entity';
import { LectureProductCategory } from './entities/lectureproductCategory.entity';
import { LectureProductCategoryResolver } from './lectureproductCategory.resolver';
import { LectureProductCategoryService } from './lectureproductCategory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JoinLectureAndProductCategory,
      LectureProductCategory,
    ]),
  ],
  providers: [LectureProductCategoryResolver, LectureProductCategoryService],
})
export class LectureProductCategoryModule {}
