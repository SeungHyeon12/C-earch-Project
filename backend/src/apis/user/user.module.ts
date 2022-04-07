import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { AuthTable } from '../auth/entities/auth.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { MentoInfo } from './entities/mento.entity';
import { User } from './entities/user.entity';
import { JoinMentoAndProductCategory } from './entities/workMento.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { JoinUserAndProductCategory } from './entities/interestUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthTable,
      MentoInfo,
      JoinMentoAndProductCategory,
      LectureProductCategory,
      JoinUserAndProductCategory,
    ]),
    JwtModule.register({}),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL,
    }),
  ],
  providers: [
    UserService, //
    UserResolver,
    AuthService,
  ],
  exports: [AuthService],
})
export class UserModule {}
