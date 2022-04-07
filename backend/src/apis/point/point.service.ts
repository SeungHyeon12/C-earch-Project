import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, POINT_STATUS_ENUM } from './entities/point.entity';
import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly connection: Connection,
  ) {}

  async findAllPoint({ currentuser }) {
    const history = await this.pointRepository
      .createQueryBuilder('point')
      .innerJoinAndSelect('point.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .orderBy('point.createdAt', 'DESC')
      .getMany();

    return history;
  }

  async create({ impUid, myamount, currentuser }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      // 1.중복결제 확인
      const myPoint = await queryRunner.manager.findOne(Point, {
        impUid: impUid,
      });
      if (myPoint) throw new ConflictException('이미 결제된 아이디입니다.');

      // 2. 거래기록 생성
      const pointPayment = await this.pointRepository.create({
        impUid: impUid,
        amount: myamount,
        user: currentuser,
        status: POINT_STATUS_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(pointPayment);
      const user = await queryRunner.manager.findOne(User, {
        where: { id: currentuser.id },
      });
      console.log('#', user);
      const updateUser = await queryRunner.manager.save(User, {
        ...user,
        point: user.point + myamount,
      });

      // const promisePayment = await Promise.all(pointPayment);
      const pointHistory = await this.walletRepository.create({
        division: '충전',
        description: '포인트를 충전하셨습니다.',
        point: +myamount,
        user: updateUser,
        payment: pointPayment,
      });

      await queryRunner.manager.save(pointHistory);
      await queryRunner.commitTransaction();
      return pointPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async cancel({ impUid, amount, currentuser }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      //중복 취소된 건인지 확인
      const myPoint = await queryRunner.manager.findOne(Point, {
        impUid: impUid,
        status: POINT_STATUS_ENUM.CANCEL,
      });

      if (myPoint) throw new ConflictException('이미 취소된 결제아이디입니다.');

      //취소하기에 내 포인트 잔액이 충분한지

      const currentPoint = await queryRunner.manager.findOne(Point, {
        impUid: impUid,
        // user: { id: currentuser.id },
        status: POINT_STATUS_ENUM.PAYMENT,
      });
      if (!currentPoint)
        throw new UnprocessableEntityException('결제기록이 존재하지 않습니다.');
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });
      if (user.point < currentPoint.amount)
        throw new UnprocessableEntityException('포인트가 부족합니다.');
      //취소기록 생성
      const pointCancel = await await queryRunner.manager.create(Point, {
        impUid: impUid,
        user: currentuser,
        status: POINT_STATUS_ENUM.CANCEL,
        amount: -amount,
      });
      await queryRunner.manager.save(pointCancel);
      await this.userRepository.save({
        ...user,
        point: user.point - amount,
      });

      const pointHistory = await this.walletRepository.create({
        division: '환불',
        description: '포인트를 환불하셨습니다.',
        point: -amount,
        user: user,
      });
      await queryRunner.manager.save(pointHistory);
      await queryRunner.commitTransaction();
      return pointCancel;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
