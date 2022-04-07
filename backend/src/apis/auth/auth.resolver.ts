import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';
import { Role } from 'src/common/auth/decorate/role.decorate';
import { GqlRefreshGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { RoleGuard } from 'src/common/auth/guard/roleGuard';
import { User, USER_ROLE } from '../user/entities/user.entity';
import { AuthService } from './auth.service';

export interface IcurrentUser {
  id: string;
  email: string;
  role: USER_ROLE;
  name: string;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Mutation(() => String) // AccessToken 발급
  async login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: any,
  ) {
    const user = await this.authService.isInfoCheck({ email, password });
    await this.authService.setRefreshToken({ user, res: context.res });
    const AccessToken = await this.authService.getAccessToken({ user });
    return AccessToken;
  }

  @Mutation(() => String)
  @UseGuards(GqlRefreshGuard)
  async refreshAccessToken(@CurrentUser() currentUser: IcurrentUser) {
    console.log('uuussseeer : ', currentUser);
    return await this.authService.getAccessToken({
      user: currentUser,
    });
  }

  @Mutation(() => String)
  @UseGuards(GqlRefreshGuard)
  async logout(
    @CurrentUser() currentUser: IcurrentUser,
    @Context() context: any,
  ) {
    const cookie = context.req.headers.cookie;
    const refreshToken = cookie.replace('refreshToken=', '');
    console.log('cooookiiiieeee', refreshToken);
    return await this.authService.enrollBlackList({
      user: currentUser,
      refreshToken,
    });
  }
}
