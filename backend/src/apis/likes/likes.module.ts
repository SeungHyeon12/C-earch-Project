import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Likes } from './entities/likes.entity';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';
import { QtBoard } from '../QtBoard/entities/qt.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Likes, QtBoard])],
  providers: [LikesResolver, LikesService],
})
export class LikesModule {}
