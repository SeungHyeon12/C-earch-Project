import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamportService } from '../iamport/iamport.service';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Point } from './entities/point.entity';
import { PointResolver } from './point.resolver';
import { PointService } from './point.service';

@Module({
  imports: [TypeOrmModule.forFeature([Point, User, Wallet])],
  providers: [PointResolver, PointService, IamportService],
})
export class PointModule {}
