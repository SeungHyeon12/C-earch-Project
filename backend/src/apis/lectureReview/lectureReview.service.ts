import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getConnection, Repository } from 'typeorm';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { User } from '../user/entities/user.entity';
import { LectureReview } from './entities/lectureReview.entity';

@Injectable()
export class LectureReviewService {
  constructor(
    @InjectRepository(LectureReview)
    private readonly lectureReviewRepository: Repository<LectureReview>,

    @InjectRepository(LectureProduct)
    private readonly lectureProductRepository: Repository<LectureProduct>,

    private readonly connection: Connection,
  ) {}

  async findLectureReviews({ lectureId }) {
    const findAllReview = await this.lectureReviewRepository.find({
      where: { lecture: { id: lectureId } },
      order: { createdAt: 'DESC' },
      relations: ['user', 'lecture'],
    });
    console.log(findAllReview);
    return findAllReview;
  }

  async findReviewCount({ lectureId }) {
    const findAllReview = await this.lectureReviewRepository.count({
      where: { lecture: { id: lectureId } },
      order: { createdAt: 'DESC' },
      relations: ['user', 'lecture'],
    });
    console.log(findAllReview);
    return findAllReview;
  }

  async findOne({ currentuser, lectureId }) {
    const findOneReview = await this.lectureReviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.user', 'user')
      .innerJoinAndSelect('review.lecture', 'lecture')
      .where('user.id = :userId', { userId: currentuser.id })
      .andWhere('lecture.id = :id', { id: lectureId })
      .orderBy('review.createdAt', 'DESC')
      .getOne();
    if (!findOneReview) return [];
    return findOneReview;
  }

  async create({ currentuser, createReviewInput }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const lecture = await queryRunner.manager.findOne(LectureProduct, {
        id: createReviewInput.lectureProductId,
      });

      const reviews = await getConnection()
        .createQueryBuilder(LectureReview, 'lecture_review')
        .innerJoinAndSelect('lecture_review.lecture', 'lecture')
        .where('lecture.id = :Id', { Id: createReviewInput.lectureProductId })
        .getMany();

      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });

      const { rating, ...rest } = lecture;
      const updateRating = (
        (rating * reviews.length + createReviewInput.starRating) /
        (reviews.length + 1)
      ).toFixed(2);
      console.log(updateRating, typeof updateRating);
      const updateLecture = await this.lectureProductRepository.create({
        ...lecture,
        rating: Number(updateRating),
      });

      const createReview = await this.lectureReviewRepository.create({
        ...createReviewInput,
        lecture: updateLecture,
        user: user,
      });

      await queryRunner.manager.save(updateLecture);
      await queryRunner.manager.save(createReview);
      await queryRunner.commitTransaction();
      return createReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async update({ currentuser, updateReviewInput }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const myReview = await getConnection()
        .createQueryBuilder(LectureReview, 'lecture_review')
        .innerJoinAndSelect('lecture_review.lecture', 'lecture')
        .where('lecture_review.id = :Id', { Id: updateReviewInput.reviewId })
        .getOne();
      console.log(myReview);
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });

      const reviews = await getConnection()
        .createQueryBuilder(LectureReview, 'lecture_review')
        .innerJoinAndSelect('lecture_review.lecture', 'lecture')
        .where('lecture.id = :Id', { Id: myReview.lecture.id })
        .getMany();

      const { rating, ...rest } = myReview.lecture;
      const updateRating = (
        (rating * reviews.length + updateReviewInput.starRating) /
        (reviews.length + 1)
      ).toFixed(2);
      const updateLecture = await this.lectureProductRepository.create({
        ...myReview.lecture,

        rating: Number(updateRating),
      });

      const createReview = await this.lectureReviewRepository.create({
        ...myReview,
        ...updateReviewInput,
        lecture: updateLecture,
        user: user,
      });
      await queryRunner.manager.save(updateLecture);
      await queryRunner.manager.save(createReview);
      await queryRunner.commitTransaction();
      return createReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete({ currentuser, reviewId }) {
    const deleteReview = await this.lectureReviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .andWhere('review.id = :reviewId', { reviewId: reviewId })
      .getOne();

    if (deleteReview) {
      await this.lectureReviewRepository.softDelete({
        id: reviewId,
      });
      return true;
    } else {
      return false;
    }
  }
}
