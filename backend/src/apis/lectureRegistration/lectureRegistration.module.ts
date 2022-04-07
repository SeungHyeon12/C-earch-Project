import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureProductService } from '../lectureProduct/lectureProduct.service';
import { JoinLectureAndProductCategory } from '../lectureproductCategory/entities/lectureproductCagtegoryclassCategory.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { LectureProductCategoryService } from '../lectureproductCategory/lectureproductCategory.service';
import { JoinUserAndProductCategory } from '../user/entities/interestUser.entity';
import { MentoInfo } from '../user/entities/mento.entity';
import { User } from '../user/entities/user.entity';
import { JoinMentoAndProductCategory } from '../user/entities/workMento.entity';
import { UserService } from '../user/user.service';
import { LectureRegistration } from './entitites/lectureRegistration.entity';
import { LectureRegistrationResolver } from './lectureRegistration.resolver';
import { LectureRegistrationService } from './lectureRegistration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LectureRegistration,
      User,
      LectureProduct,
      MentoInfo,
      JoinMentoAndProductCategory,
      LectureProductCategory,
      JoinLectureAndProductCategory,
      JoinUserAndProductCategory,
    ]),
  ],
  providers: [
    LectureRegistrationResolver,
    LectureRegistrationService,
    LectureProductService,
    UserService,
  ],
})
export class LectureRegistrationModule {}
