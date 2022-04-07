import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getRepository, Repository } from 'typeorm';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureRegistration } from '../lectureRegistration/entitites/lectureRegistration.entity';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import {
  LectureOrder,
  REGISTRATION_STATUS_ENUM,
} from './entities/lectureOrder.entity';
import { IcurrentUser } from '../auth/auth.resolver';
interface IFindOne {
  lectureorderId: string;
  currentUser: IcurrentUser;
}
interface IUpdate {
  lectureOrderId: string;
}
@Injectable()
export class LectureOrderService {
  constructor(
    @InjectRepository(LectureOrder)
    private readonly lectureOrderRepository: Repository<LectureOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LectureRegistration)
    private readonly lectureRegistrationRepository: Repository<LectureRegistration>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(LectureProduct)
    private readonly lectureProductRepository: Repository<LectureProduct>,

    private readonly connection: Connection,
  ) {}

  async create({ lectureRegistrationId, currentUser }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      console.log(currentUser);
      const user = await queryRunner.manager.findOne(User, {
        id: currentUser.id,
      });
      const order = await getRepository(LectureRegistration)
        .createQueryBuilder('lectureregistration')
        .leftJoinAndSelect('lectureregistration.product', 'lecproduct')
        .getOne();
      console.log(user);
      if (user.point >= order.product.classPrice) {
        const payment = await this.lectureOrderRepository.create({
          registrationStatus: REGISTRATION_STATUS_ENUM.PAID,
          registration: order,
        });
        const updateNewuser = await this.userRepository.create({
          ...user,
          point: user.point - order.product.classPrice,
        });
        const pointHistory = this.walletRepository.create({
          division: '구매',
          description: '클래스를 구매하셨습니다.',
          point: -order.product.classPrice,

          user: user,
        });
        await queryRunner.manager.save(pointHistory);
        const balance = await queryRunner.manager.save(updateNewuser);
        console.log('결제진행');
        const result = await queryRunner.manager.save(payment);
        await queryRunner.commitTransaction();
        return result;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotAcceptableException('잔액이 부족합니다');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const findAllOrders = await this.lectureOrderRepository.find({
      take: 10,
      order: { createdAt: 'DESC' },
    });
    return findAllOrders;
  }

  async findOne({ lectureorderId }: IFindOne) {
    return await this.lectureOrderRepository.findOne({
      where: { id: lectureorderId },
    });
  }

  async update({ lectureOrderId }: IUpdate) {
    const currentlectureRegistration =
      await this.lectureOrderRepository.findOne({
        id: lectureOrderId,
      });
    const newlectureOrder = {
      ...currentlectureRegistration,
    };
    return await this.lectureOrderRepository.save(newlectureOrder);
  }

  async delete({ lectureorderId }) {
    const result = await this.lectureOrderRepository.softDelete({
      id: lectureorderId,
    });
    return result.affected ? true : false;
  }
}
