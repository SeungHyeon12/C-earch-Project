import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { getToday } from 'src/utils/getToday';
import { Connection, getConnection, Like, Raw, Repository } from 'typeorm';
import { IcurrentUser } from '../auth/auth.resolver';
import { CommentsModule } from '../comments/comments.module';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { MentorForm } from './dto/mentoForm.input';
import { UserForm } from './dto/user.input';
import { JoinUserAndProductCategory } from './entities/interestUser.entity';
import { MentoInfo, MENTOR_AUTH } from './entities/mento.entity';
import { User, USER_ROLE } from './entities/user.entity';
import { JoinMentoAndProductCategory } from './entities/workMento.entity';

interface IcreateUserForm {
  userForm: UserForm;
}

interface ImentorForm {
  user: IcurrentUser;
  mentorForm: MentorForm;
  category: string[];
}

interface IupdateMento {
  user: IcurrentUser;
  mentorForm: MentorForm;
  category: string[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MentoInfo)
    private readonly mentoInfoRepository: Repository<MentoInfo>,
    @InjectRepository(JoinMentoAndProductCategory)
    private readonly joinMentoAndProductCtgRepository: Repository<JoinMentoAndProductCategory>,
    @InjectRepository(JoinUserAndProductCategory)
    private readonly joinUserAndProductCtgRepository: Repository<JoinMentoAndProductCategory>,
    private readonly connection: Connection,
  ) {} //

  async findSignInCount({ date }) {
    const newUser = await this.userRepository.count({
      createdAt: Like(`${date}%`),
    });
    console.log(`newUser: ${newUser}`);
    return newUser;
  }

  async findMentorCount() {
    const myMentor = await this.mentoInfoRepository.count({
      where: { mentoStatus: MENTOR_AUTH.AUTHROIZED },
    });
    return myMentor;
  }
  async findMyPage({ currentUser }) {
    const myUser = await getConnection()
      .createQueryBuilder(User, 'user')
      .leftJoinAndSelect('user.interest', 'interest')
      .leftJoinAndSelect(
        'interest.linkedToLectureProductCategory',
        'joinCategory',
      )
      .where('user.id = :id', { id: currentUser.id })
      .getOne();

    return myUser;
  }
  async findMentoPage({ currentUser }) {
    const myUser = await getConnection()
      .createQueryBuilder(User, 'user')
      .innerJoinAndSelect('user.mentor', 'mentor')
      .leftJoinAndSelect('user.interest', 'interest')
      .leftJoinAndSelect(
        'interest.linkedToLectureProductCategory',
        'joinCategory',
      )
      .leftJoinAndSelect('mentor.work', 'work')
      .leftJoinAndSelect('work.category', 'category')
      .where('user.id = :id', { id: currentUser.id })
      .getOne();
    return myUser;
  }

  async findOne({ email }) {
    const myUser = await this.userRepository.findOne({
      where: { email: email },
    });
    return myUser;
  }

  async isCheckEmail({ email }) {
    const result = await this.userRepository.findOne({ where: { email } });
    if (result === undefined) {
      return false;
    }
    return true;
  }

  async saveForm({ userForm }: IcreateUserForm) {
    const { password, ...userInfo } = userForm;
    const hashedPassword = await bcrypt.hash(password, 10); // 해쉬로 비밀번호 바꿔서 저장
    userForm = {
      password: hashedPassword,
      ...userInfo,
    };
    console.log(userForm);
    const result = await this.userRepository.save({ ...userForm });
    return result;
  }

  async updatePassword({ email, newPassword }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      const user = await queryRunner.manager.findOne(User, { email });
      const userUpdated = await queryRunner.manager.save(User, {
        ...user,
        password: hashedPassword,
      });

      await queryRunner.commitTransaction();
      return userUpdated;
    } catch (error) {
      throw new UnprocessableEntityException('MYSQL CANT UPDATE NEW PASSWORD');
    } finally {
      await queryRunner.release();
    }
  }

  async promoteMento({ userId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const userApplier = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.mentor', 'mentor')
        .where('user.id = :id', { id: userId })
        .getOne();
      console.log('userApplier', userApplier);
      const promotedMento = await queryRunner.manager.save(MentoInfo, {
        ...userApplier.mentor,
        mentoStatus: MENTOR_AUTH.AUTHROIZED,
      });
      const promotedUser = await queryRunner.manager.save(User, {
        ...userApplier,
        role: USER_ROLE.MENTOR,
        mentor: promotedMento,
      });
      await queryRunner.commitTransaction();
      return promotedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException(
        'MYSQL CANT UPDATE MENTOR AUTHROIZED',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async sendMentorForm({ mentorForm, user, category }: ImentorForm) {
    const querryRunner = this.connection.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction('REPEATABLE READ');
    try {
      const userFind = await querryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      const mento = await querryRunner.manager.save(MentoInfo, {
        ...mentorForm,
        user: userFind,
      });

      const joinedCtgMento = category.map(async (ctg) => {
        const ctgFind = await querryRunner.manager.findOne(
          LectureProductCategory,
          {
            categoryname: ctg,
          },
        );
        const joinProductCtg = await querryRunner.manager.save(
          JoinMentoAndProductCategory,
          {
            category: ctgFind,
            mentor: mento,
          },
        );
        return joinProductCtg;
      });
      const joinedCtgMentoPromise = await Promise.all(joinedCtgMento);
      console.log('promise Joined : ', joinedCtgMentoPromise);
      const savedMentoInfo = await querryRunner.manager.save(MentoInfo, {
        ...mento,
        work: joinedCtgMentoPromise,
      });
      await querryRunner.manager.save(User, {
        ...userFind,
        mentor: mento,
      });

      await querryRunner.commitTransaction();
      return savedMentoInfo;
    } catch (error) {
      console.log(error);
      await querryRunner.rollbackTransaction();
      throw new UnprocessableEntityException('Cant update with mentor Form');
    } finally {
      await querryRunner.release();
    }
  }

  async fetchMentor({ page }) {
    const results = await this.mentoInfoRepository
      .createQueryBuilder('mentor')
      .innerJoinAndSelect('mentor.user', 'user')
      .innerJoinAndSelect('mentor.work', 'work')
      .innerJoinAndSelect('work.category', 'ctg')
      .where('mentor.mentoStatus = :status', { status: MENTOR_AUTH.AUTHROIZED })
      .take(40)
      .skip(40 * (page - 1))
      .getMany();

    console.log(results);
    return results;
  }

  async fetchMentorWithCategory({ page, categoryName }) {
    const results = await this.mentoInfoRepository
      .createQueryBuilder('mento')
      .innerJoinAndSelect('mento.user', 'user')
      .innerJoinAndSelect('mento.work', 'work')
      .innerJoinAndSelect('work.category', 'ctg')
      .where('ctg.categoryname = :categoryName', { categoryName })
      .take(40)
      .skip(40 * (page - 1))
      .getMany();

    console.log(results);
    return results;
  }
  async fetchAuthorMentor() {
    const MentoApply = await this.mentoInfoRepository
      .createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .innerJoinAndSelect('mentor.work', 'work')
      .innerJoinAndSelect('work.category', 'ctg')
      .where('mentor.mentoStatus = :status', { status: MENTOR_AUTH.PENDING })
      .getMany();
    console.log(MentoApply);
    return MentoApply;
  }

  async updateMentoForm({ user, mentorForm, category }: IupdateMento) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const userFind = await queryRunner.manager.findOne(User, { id: user.id });
      const mentoFormPast = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.mentor', 'mentor')
        .where('user.id = :id', { id: user.id })
        .getOne();
      console.log('mentoFormPast : ', mentoFormPast);
      const userWorkList = await this.joinMentoAndProductCtgRepository
        .createQueryBuilder('work')
        .where('work.mento = :id', { id: mentoFormPast.mentor.id })
        .getMany();
      console.log('userWorkList : ', userWorkList);
      const workList = userWorkList.map((userWork) => {
        return queryRunner.manager.softDelete(JoinMentoAndProductCategory, {
          id: userWork.id,
        });
      });
      await Promise.all(workList);

      const mentoUpdate = await queryRunner.manager.save(MentoInfo, {
        ...mentoFormPast,
        ...mentorForm,
      });

      const joinedCtgMento = category.map(async (ctg) => {
        const ctgFind = await queryRunner.manager.findOne(
          LectureProductCategory,
          {
            categoryname: ctg,
          },
        );
        const joinProductCtg = await queryRunner.manager.save(
          JoinMentoAndProductCategory,
          {
            category: ctgFind,
            mentor: mentoUpdate,
          },
        );
        return joinProductCtg;
      });
      const joinedCtgMentoPromise = await Promise.all(joinedCtgMento);
      console.log('promise Joined : ', joinedCtgMentoPromise);
      const savedMentoInfo = await queryRunner.manager.save(MentoInfo, {
        ...mentoUpdate,
        work: joinedCtgMentoPromise,
      });
      await queryRunner.manager.save(User, {
        ...userFind,
        mentor: savedMentoInfo,
      });
      await queryRunner.commitTransaction();
      return savedMentoInfo;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException("can't update MentoInfo");
    } finally {
      await queryRunner.release();
    }
  }
  async updateUserForm({ user, updateUserForm, category }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const userFind = await queryRunner.manager.findOne(User, { id: user.id });
      const userinterestList = await this.joinUserAndProductCtgRepository
        .createQueryBuilder('interest')
        .leftJoinAndSelect(
          'interest.linkedToLectureProductCategory',
          'category',
        )
        .where('interest.user = :id', { id: userFind.id })
        .getMany();
      console.log('userWorkList : ', userinterestList);
      const workList = userinterestList.map((interest) => {
        return queryRunner.manager.softDelete(JoinUserAndProductCategory, {
          id: interest.id,
        });
      });
      await Promise.all(workList);
      const userUpdate = await queryRunner.manager.save(User, {
        ...userFind,
        ...updateUserForm,
      });
      const joinedCtg = category.map(async (ctg) => {
        const ctgFind = await queryRunner.manager.findOne(
          LectureProductCategory,
          {
            categoryname: ctg,
          },
        );
        const joinProductCtg = await queryRunner.manager.save(
          JoinUserAndProductCategory,
          {
            linkedToLectureProductCategory: ctgFind,
            user: userUpdate,
          },
        );
        console.log(joinProductCtg);
        return joinProductCtg;
      });

      const joinedCtgPromise = await Promise.all(joinedCtg);
      const saveUserInfo = await queryRunner.manager.save(MentoInfo, {
        ...userUpdate,
        interest: joinedCtgPromise,
      });
      console.log(saveUserInfo);
      await queryRunner.commitTransaction();
      return saveUserInfo;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException("can't update UserInfo");
    } finally {
      await queryRunner.release();
    }
  }

  async permitLecture({ currentUser, mentorId, lectureId }) {
    const querryRunner = this.connection.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction('REPEATABLE READ');
    try {
      const user = await querryRunner.manager.findOne(User, {
        id: currentUser.id,
      });
      const lecture = await getConnection()
        .createQueryBuilder(MentoInfo, 'mentoinfo')
        .innerJoinAndSelect('mentoinfo.lecture', 'lecture')
        .where('mento.id = :mentoId', { mentoId: mentorId })
        .andWhere('lecture.id = :id', { id: lectureId })
        .getOne();
      if (!lecture) {
        throw new UnprocessableEntityException('허가할 강의가 없습니다.');
      }
      await querryRunner.manager.save(LectureProduct, {
        ...lecture,
        classOpen: true,
      });
    } catch (error) {
      console.log(error);
      await querryRunner.rollbackTransaction();
      throw new UnprocessableEntityException('강의를 허가할 수 없습니다.');
    } finally {
      await querryRunner.release();
    }
  }

  async delete({ currentUser, userId }) {
    const querryRunner = this.connection.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction('REPEATABLE READ');
    try {
      const user = await querryRunner.manager.findOne(User, {
        id: currentUser.id,
      });

      const result = await querryRunner.manager.softDelete(User, {
        id: userId,
      });
      await querryRunner.commitTransaction();
      return result.affected ? true : false;
    } catch (error) {
      console.log(error);
      await querryRunner.rollbackTransaction();
      throw new UnprocessableEntityException('유저를 삭제 할 수 없습니다.');
    } finally {
      await querryRunner.release();
    }
  }
}
