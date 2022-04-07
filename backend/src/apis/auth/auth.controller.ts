import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(req, res) {
    // 1.가입확인
    const user = await this.userService.findOne({ email: req.user.email });
    // 2.회원가입
    if (!user) {
      const { password, ...rest } = req.user;
      const hashedPassword = await bcrypt.hash(String(password), 1);
      const userForm = { password: hashedPassword, ...rest };
      await this.userService.saveForm({ userForm });
    }
    this.authService.setRefreshToken({ user, res });
    res.redirect('https://www.codesearch.shop');
  }

  @Get('/login/google/callback')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req: Request, //
    @Res() res: Response,
  ) {
    return await this.login(req, res);
  }
}
