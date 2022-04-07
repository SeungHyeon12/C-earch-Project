import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTable } from './entities/auth.entity';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { JwtRefreshStrategy } from 'src/common/auth/strategy/refresh.strategy.jwt';
import { AuthController } from './auth.controller';
import { JwtGooglestrategy } from 'src/common/auth/strategy/social-google.strategy.jwt';
import { UserService } from '../user/user.service';
import { MentoInfo } from '../user/entities/mento.entity';
import { JoinMentoAndProductCategory } from '../user/entities/workMento.entity';
import { JoinUserAndProductCategory } from '../user/entities/interestUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthTable,
      User,
      MentoInfo,
      JoinMentoAndProductCategory,
      JoinUserAndProductCategory,
    ]), //
    JwtModule.register({}),
  ],
  providers: [
    AuthResolver, //
    AuthService,
    UserService,
    JwtRefreshStrategy,
    JwtGooglestrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
