import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureProductResolver } from '../lectureProduct/lectureProduct.resolver';
import { LectureProductService } from '../lectureProduct/lectureProduct.service';
import { JoinLectureAndProductCategory } from '../lectureproductCategory/entities/lectureproductCagtegoryclassCategory.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { LectureRegistration } from '../lectureRegistration/entitites/lectureRegistration.entity';
import { LectureRegistrationResolver } from '../lectureRegistration/lectureRegistration.resolver';
import { LectureRegistrationService } from '../lectureRegistration/lectureRegistration.service';
import { MentoInfo } from '../user/entities/mento.entity';
import { User } from '../user/entities/user.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { JoinMentoAndProductCategory } from '../user/entities/workMento.entity';
import { UserService } from '../user/user.service';
import { Wallet } from '../wallet/entities/wallet.entity';
import { LectureOrder } from './entities/lectureOrder.entity';
import { LectureOrderResolver } from './lectureOrder.resolver';
import { LectureOrderService } from './lectureOrder.service';
import { JoinUserAndProductCategory } from '../user/entities/interestUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LectureOrder,
      LectureRegistration,
      User,
      LectureProduct,
      MentoInfo,
      Wallet,
      LectureProductCategory,
      JoinMentoAndProductCategory,
      JoinLectureAndProductCategory,
      JoinUserAndProductCategory,
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],
  providers: [
    LectureOrderResolver,
    LectureOrderService,
    LectureRegistrationService,
    LectureRegistrationResolver,
    LectureProductService,
    LectureProductResolver,
    UserService,
  ],
})
export class LectureOrderModule {}
