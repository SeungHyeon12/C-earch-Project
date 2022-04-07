import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthTable, AUTH_KIND } from './entities/auth.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { getTemplate } from 'src/utils/template';

interface ItokenPhone {
  phoneNumber: string;
  authNumber: string;
}

interface ItokenEmail {
  email: string;
  authNumber: string;
}

interface ItokenCheck {
  indexer: string;
  kind: AUTH_KIND;
  inputToken: string;
}

interface IinfoCheck {
  email: string;
  password: string;
}

interface IsetToken {
  user: User;
  res: any;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthTable)
    private readonly authTableRepository: Repository<AuthTable>, //

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly jwtService: JwtService,
  ) {}

  async makeToken({ indexer, kind }) {
    // EMAIL 혹은 폰번호가 INDEXER  KIND 는 결제 종류
    const randomNumber = Math.floor(Math.random() * 10000);
    const authNumber = String(randomNumber).padStart(4, '0');
    await this.authTableRepository.save({
      indexer,
      authNumber,
      kind,
    });
    return authNumber;
  }

  async checkToken({ indexer, kind, inputToken }: ItokenCheck) {
    const result = await this.authTableRepository.findOne({
      where: { kind, indexer },
      order: {
        createdAt: 'DESC',
      },
    });
    if (result === undefined)
      throw new UnprocessableEntityException('해당 인증번호가 없음');
    if (result.authNumber != inputToken) return false;
    return true;
  }

  async sendTokenPhone({ phoneNumber, authNumber }: ItokenPhone) {
    const appKey = process.env.SMS_APP_KEY;
    const XSecretKey = process.env.SMS_X_SECRET_KEY;
    const sender = process.env.SMS_SENDER;
    try {
      const result = await axios.post(
        `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${appKey}/sender/sms`,
        {
          body: `안녕하세요. 인증번호는 ${authNumber}입니다.`,
          sendNo: sender,
          recipientList: [
            {
              internationalRecipientNo: phoneNumber,
            },
          ],
        },
        {
          headers: {
            'X-Secret-Key': XSecretKey,
            'Content-Type': 'application/json;charset=UTF-8',
          },
        },
      );
      return '정상적으로 보내졌습니다';
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'cannot send mesage to Phone',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendTokenEmail({ email, authNumber }: ItokenEmail) {
    const appKey = process.env.EMAIL_APP_KEY;
    const secretKey = process.env.EMAIL_X_SECRET_KEY;
    const sender = process.env.EMAIL_SENDER;
    const template = getTemplate({ authNumber });
    try {
      const result = await axios.post(
        `https://api-mail.cloud.toast.com/email/v2.0/appKeys/${appKey}/sender/mail`,
        {
          senderAddress: sender,
          title: 'Cearch 에서 귀하의 인증번호를 보냈습니다',
          body: template,
          receiverList: [
            {
              receiveMailAddr: email,
              receiveType: 'MRT0',
            },
          ],
        },
        {
          headers: {
            'X-Secret-Key': secretKey,
            'Content-Type': 'application/json;charset=UTF-8',
          },
        },
      );
      console.log('email : ', result);
      return '정상적으로 보내졌습니다';
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'cannot send mesage to Email',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isInfoCheck({ email, password }: IinfoCheck) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user === undefined) {
      throw new UnauthorizedException('비밀번호 혹은 아이디가 잘못되었습니다');
    }
    const passwordCheck = await bcrypt.compare(password, user.password);
    console.log('passwordCheck : ', passwordCheck);
    if (!passwordCheck) {
      throw new UnauthorizedException('비밀번호 혹은 아이디가 잘못되었습니다');
    }
    return user;
  }

  async setRefreshToken({ user, res }: IsetToken) {
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.REFRESH_KEY_TOKEN,
        expiresIn: '8h',
      },
    );

    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
    return refreshToken;
  }

  async getAccessToken({ user }) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.ACCESS_KEY_TOKEN,
        expiresIn: '1h',
      },
    );
    return accessToken;
  }

  async enrollBlackList({ user, refreshToken }) {
    try {
      console.log('useeerrr exp : ', user.exp);
      const result = await this.cacheManager.set(
        `refresh:${refreshToken}`,
        `Token:${user.id}`,
        {
          ttl: user.exp - Math.ceil(Number(Date.now()) / 1000),
        },
      );

      return result;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Redis error occured');
    }
  }
}
