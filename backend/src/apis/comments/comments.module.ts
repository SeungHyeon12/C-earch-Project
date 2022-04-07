import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from '../comments/entities/comments.entity';
import { QtBoard } from '../QtBoard/entities/qt.entity';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([QtBoard, Comments, User, Wallet])],
  //   controllers: [AppController],
  providers: [CommentsResolver, CommentsService],
})
export class CommentsModule {}
