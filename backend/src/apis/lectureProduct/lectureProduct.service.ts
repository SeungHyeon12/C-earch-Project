import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getConnection, Repository } from 'typeorm';
import { IcurrentUser } from '../auth/auth.resolver';
import { REGISTRATION_STATUS_ENUM } from '../lectureOrder/entities/lectureOrder.entity';
import { JoinLectureAndProductCategory } from '../lectureproductCategory/entities/lectureproductCagtegoryclassCategory.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { MentoInfo } from '../user/entities/mento.entity';
import { User, USER_ROLE } from '../user/entities/user.entity';
import { CreateLectureProductInput } from './dto/createLectureProduct.input';
import { LectureProduct } from './entities/lectureProduct.entity';
interface ICreate {
  createLectureProductInput: CreateLectureProductInput;
  user: IcurrentUser;
}
interface IFindOne {
  lectureproductId: string;
  page: number;
}
interface IUpdate {
  lectureproductId: string;
  createLectureProductInput;
}
@Injectable()
export class LectureProductService {
  constructor(
    @InjectRepository(LectureProduct)
    private readonly lectureProductRepository: Repository<LectureProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LectureProductCategory)
    private readonly lectureproductCategoryRepository: Repository<LectureProductCategory>,
    @InjectRepository(MentoInfo)
    private readonly mentoinfoRepository: Repository<MentoInfo>,
    @InjectRepository(JoinLectureAndProductCategory)
    private readonly joinlectureandproductRepository: Repository<JoinLectureAndProductCategory>,

    private readonly connection: Connection,
  ) {}

  async create({ createLectureProductInput, user }: ICreate) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const { classCategories, ...rest } = createLectureProductInput;
      const query = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.mentor', 'mentor')
        .where('user.id = :id', { id: user.id })
        .getOne();
      const mentor = query.mentor;

      const result = await this.lectureProductRepository.save({
        ...rest,
        mentor: mentor,
      });
      const categories = [];
      for (let i = 0; i < classCategories.length; i++) {
        const lecturecategories = classCategories[i].replace('#', '');
        const prevTag = await this.lectureproductCategoryRepository.findOne({
          categoryname: lecturecategories,
        });

        const join = await this.joinlectureandproductRepository.save({
          lectureproductcategory: prevTag,
          lectureproduct: result,
        });
        categories.push(join);
      }
      const result2 = await this.lectureProductRepository.create({
        ...result,
        joinproductandproductcategory: categories,
      });
      await queryRunner.manager.save(result2);
      await queryRunner.commitTransaction();
      return result2;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findLectureWithMentor({ currentuser }) {
    const mylecturefinder = await this.lectureProductRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .leftJoinAndSelect('product.registration', 'registration')
      .leftJoinAndSelect('registration.order', 'order')
      .where('user.id = :Id', { Id: currentuser.id })
      // .andWhere('order.registrationStatus = :status', {status: REGISTRATION_STATUS_ENUM.PAID})
      .getMany();
    return mylecturefinder;
  }

  async findLectureWithMentee({ currentuser }) {
    const registeredlecturefinder = await this.lectureProductRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'mentoruser')
      .leftJoinAndSelect('product.registration', 'registration')
      .leftJoinAndSelect('registration.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .getMany();
    console.log('내가 신청한 강의', registeredlecturefinder);
    return registeredlecturefinder;
  }

  async findAll() {
    const result = await this.lectureProductRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .leftJoinAndSelect('mentor.work', 'work')
      .leftJoinAndSelect('work.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .getMany();
    return result;
  }

  async findOne({ lectureproductId }: IFindOne) {
    const lecture = await this.lectureProductRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .leftJoinAndSelect('mentor.work', 'work')
      .leftJoinAndSelect('work.category', 'category')
      .where('product.id = :id', { id: lectureproductId })
      .getOne();
    return lecture;
  }

  async findPopular() {
    const popular = await this.lectureProductRepository
      .createQueryBuilder('lecture')
      .leftJoinAndSelect('lecture.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .orderBy('lecture.rating', 'DESC')
      .take(8)
      .getMany();
    return popular;
  }

  async findNewClasses() {
    const findNewClasses = await this.lectureProductRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jlpc')
      .innerJoinAndSelect('jlpc.lectureproductcategory', 'lpc')
      .leftJoinAndSelect('product.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .take(8)
      .getMany();
    return findNewClasses;
  }

  async fetchSelectedTagLectures({ lectureproductcategoryname, page }) {
    const selectedtag = await getConnection()
      .createQueryBuilder(LectureProduct, 'product')
      .innerJoinAndSelect('product.joinproductandproductcategory', 'jointable')
      .innerJoinAndSelect('product.mentor', 'mentor')
      .innerJoinAndSelect('mentor.user', 'user')
      .innerJoinAndSelect('jointable.lectureproductcategory', 'category')
      .where('category.categoryname = :categoryname', {
        categoryname: lectureproductcategoryname,
      })
      .orderBy('jointable.createdAt', 'DESC')
      .limit(40)
      .offset(15 * (page - 1))
      .getMany();
    return selectedtag;
  }

  async update({ lectureproductId, createLectureProductInput }: IUpdate) {
    const currentlectureproduct = await this.lectureProductRepository.findOne({
      id: lectureproductId,
    });
    const newlectureproduct = {
      ...currentlectureproduct,
      createLectureProductInput,
    };
    return await this.lectureProductRepository.save(newlectureproduct);
  }

  async delete({ lectureproductId }) {
    const deletelecture = await this.lectureProductRepository.softDelete({
      id: lectureproductId,
    });
    console.log('삭제완료');
    return deletelecture.affected ? true : false;
  }

  async fetchLectureDetail({ lectureId }) {
    const lectureDetail = await this.lectureProductRepository
      .createQueryBuilder('lecture')
      .innerJoinAndSelect('lecture.mentor', 'mentor')
      .innerJoinAndSelect('mentor.user', 'user')
      .where('lecture.id = :lectureId', { lectureId })
      .getOne();
    console.log('lectureDetail : ', lectureDetail);
    return lectureDetail;
  }
}
