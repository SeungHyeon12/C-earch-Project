import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { User } from '../user/entities/user.entity';
import { IcurrentUser } from '../auth/auth.resolver';
import { CreateLectureRegistrationInput } from './dto/createLectureRegistration.input';
import { UpdateLectureRegistrationInput } from './dto/updateLectureRegistration.input';
import { LectureRegistration } from './entitites/lectureRegistration.entity';

// Interface
interface ICreate {
  createLectureRegistrationInput: CreateLectureRegistrationInput;
  productId: string;
  user: IcurrentUser;
}
interface IFindOne {
  lectureRegistrationId: string;
}
interface IUpdate {
  lectureRegistrationId: string;
  updatelectureRegistrationInput: UpdateLectureRegistrationInput;
}
@Injectable()
export class LectureRegistrationService {
  constructor(
    @InjectRepository(LectureRegistration)
    private readonly lectureRegistrationRepository: Repository<LectureRegistration>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LectureProduct)
    private readonly lectureproductRepository: Repository<LectureProduct>,

    private readonly connection: Connection,
  ) {}

  async create({ user, createLectureRegistrationInput, productId }: ICreate) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const currentuser = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: user.id })
        .getOne();
      console.log('currentuser : ', currentuser);

      const product = await this.lectureproductRepository.findOne({
        id: productId,
      });
      const result = await this.lectureRegistrationRepository.create({
        ...createLectureRegistrationInput,
        user: currentuser,
        product: product,
      });
      await queryRunner.manager.save(result);
      await queryRunner.commitTransaction();
      console.log('신청완료되었습니다');
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll({ currentUser }) {
    const result = await this.lectureRegistrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.user', 'user')
      .leftJoinAndSelect('registration.product', 'product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.image', 'image')
      .where('user.id = :id', { id: currentUser.id })
      .getMany();

    return result;
  }

  async findOne({ lectureRegistrationId }: IFindOne) {
    return await this.lectureRegistrationRepository.findOne({
      where: { id: lectureRegistrationId },
    });
  }

  async update({
    lectureRegistrationId,
    updatelectureRegistrationInput,
  }: IUpdate) {
    const currentlectureRegistration =
      await this.lectureRegistrationRepository.findOne({
        id: lectureRegistrationId,
      });
    const newlectureRegistration = {
      ...currentlectureRegistration,
      ...updatelectureRegistrationInput,
    };
    return await this.lectureRegistrationRepository.save(
      newlectureRegistration,
    );
  }

  async delete({ lectureRegistrationId }) {
    const result = await this.lectureRegistrationRepository.softDelete({
      id: lectureRegistrationId,
    });
    return result.affected ? true : false;
  }
}
