import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from '../comments/entities/comments.entity';
import { PostImage } from '../postImage/entities/postImage.entity';
import { User } from '../user/entities/user.entity';
import { Notice } from './entities/notice.entity';
import { QtBoard } from './entities/qt.entity';
import { JoinQtBoardAndProductCategory } from './entities/qtTags.entity';
import { QtBoardResolver } from './QtBoard.resolver';
import { QtBoardService } from './QtBoard.service';
//각각의 모듈을 최종적으로 조립하는것 이것을 최종적으로 app.module로 가져가는것.

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QtBoard,
      Comments,
      User,
      PostImage,
      Notice,
      JoinQtBoardAndProductCategory,
    ]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL,
    }),
  ],

  //   controllers: [AppController],
  providers: [QtBoardResolver, QtBoardService],
})
export class QtBoardModule {}
