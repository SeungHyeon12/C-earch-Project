import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './apis/auth/auth.module';
import { UserModule } from './apis/user/user.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { AppService } from './app.service';
import { CommentsModule } from './apis/comments/comments.module';
import { LectureProductModule } from './apis/lectureProduct/lectureProduct.module';
import { QtBoardModule } from './apis/QtBoard/QtBoard.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtAccessStrategy } from './common/auth/strategy/access.strategy.jwt';
import { JwtRefreshStrategy } from './common/auth/strategy/refresh.strategy.jwt';
import { LectureProductCategoryModule } from './apis/lectureproductCategory/lectureproductCategory.module';
import { LectureOrderModule } from './apis/lectureOrder/lectureOrder.module';
import { LectureRegistrationModule } from './apis/lectureRegistration/lectureRegistration.module';
import { LikesModule } from './apis/likes/likes.module';
import { PointModule } from './apis/point/point.module';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from './apis/file/file.module';
import { FollowModule } from './apis/follow/follow.module';
import { LectureReviewModule } from './apis/lectureReview/lectureReview.module';
import { WalletModule } from './apis/wallet/wallet.module';
import { SocketModule } from './apis/socket.io/module.socket';
import { SocketGateway } from './common/socketutils/websocket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
// import { SocketModule } from './socket.io/module.socket';

@Module({
  imports: [
    WalletModule,
    LikesModule,
    AuthModule,
    UserModule,
    QtBoardModule,
    CommentsModule,
    PointModule,
    LectureReviewModule,
    LectureProductModule,
    LectureProductCategoryModule,
    LectureRegistrationModule,
    LectureOrderModule,
    FileUploadModule,
    FollowModule,
    SocketModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: '/src/grapqhql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      driver: ApolloDriver,
      cors: {
        credential: true,
        origin: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      entities: [__dirname + '/apis/**/*.entity.*'],
      logging: true,
      synchronize: false,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AppModule {}
