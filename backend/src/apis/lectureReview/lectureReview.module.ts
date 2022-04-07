import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LectureReview } from './entities/lectureReview.entity';
import { LectureReviewResolver } from './lectureReview.resolver';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureReviewService } from './lectureReview.service';

@Module({
  imports: [TypeOrmModule.forFeature([LectureReview, LectureProduct])],
  //   controllers: [AppController],
  providers: [LectureReviewResolver, LectureReviewService],
})
export class LectureReviewModule {}
