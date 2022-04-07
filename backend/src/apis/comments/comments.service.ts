import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { QtBoard } from '../QtBoard/entities/qt.entity';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Comments } from './entities/comments.entity';

interface IFindOne {
  postId: string;
  page: number;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentsRepository: Repository<Comments>,
    @InjectRepository(QtBoard)
    private readonly qtBoardRepository: Repository<QtBoard>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    private readonly connection: Connection,
  ) {}

  //대댓글 보기
  async findAllReComment({ commentId, page }) {
    const findAllco = await this.commentsRepository.find({
      where: { id: commentId },
      order: { depth: 'ASC', createdAt: 'ASC' },
      take: 5, // 한 페이지에 10개
      skip: 5 * (page - 1),
      relations: ['user', 'qtBoard'],
    });
    return findAllco;
  }

  async findMyComments({ currentuser, page }) {
    const myQts = await this.commentsRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.qtBoard', 'qtBoard')
      .innerJoinAndSelect('comments.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .orderBy('comments.createdAt', 'DESC')
      .limit(15)
      .offset(15 * (page - 1))
      .getMany();
    return myQts;
  }

  async findOne({ postId, page }: IFindOne) {
    const findOnePost = await this.commentsRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('comments.qtBoard', 'qtBoard')
      .where('qtBoard.id = :id', { id: postId })
      .andWhere(`comments.parent = :parent`, { parent: '1' }) //parent 가 1인 댓글만 찾기
      .orderBy('comments.isPick', 'DESC')
      .limit(5)
      .offset(5 * (page - 1))
      .addOrderBy('comments.createdAt')
      .getMany();
    console.log(findOnePost);
    if (findOnePost === undefined) return [];
    console.log('😂', findOnePost);
    return findOnePost;
  }

  //기본 댓글 생성
  async create({ currentuser, postId, contents }) {
    // 포스트 찾기
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });
      const post = await queryRunner.manager.findOne(QtBoard, { id: postId });
      const createQtBoard = await this.qtBoardRepository.create({
        ...post,
        commentsCount: post.commentsCount + 1,
      });

      const createcomment = await this.commentsRepository.create({
        qtBoard: createQtBoard,
        contents: contents,
        user: user,
      });
      console.log(`🍳`, createcomment);
      await queryRunner.manager.save(createQtBoard);
      await queryRunner.manager.save(createcomment);
      await queryRunner.commitTransaction();
      return createcomment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //기본 댓글 수정
  async update({ currentuser, commentId, acontents }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const comment = await queryRunner.manager.findOne(Comments, {
        id: commentId,
      });

      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });

      const newcontent = { ...comment, user: user, contents: acontents };
      const result = await this.commentsRepository.create(newcontent);
      await queryRunner.manager.save(result);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //기본 댓글 삭제
  async delete({ currentuser, commentId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const deleteComment = await this.commentsRepository
        .createQueryBuilder('comments')
        .innerJoinAndSelect('comments.user', 'user')
        .innerJoinAndSelect('comments.qtBoard', 'qtBoard')
        .where('user.id = :userId', { userId: currentuser.id })
        .andWhere('comments.id = :Id', { Id: commentId })
        .getOne();
      if (deleteComment) {
        await this.commentsRepository.softDelete({
          id: commentId,
        });
        await this.commentsRepository.softDelete({
          parent: commentId,
        });
        const post = await this.qtBoardRepository.findOne({
          id: deleteComment.qtBoard.id,
        });
        const createQtBoard = await this.qtBoardRepository.create({
          ...post,
          commentsCount: post.commentsCount - 1,
        });
        await queryRunner.manager.save(createQtBoard);
        await queryRunner.commitTransaction();
        return true;
      } else {
        await queryRunner.commitTransaction();
        return false;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //대댓글 생성
  async createReply({ currentuser, commentId, contents }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const selectComment = await this.commentsRepository
        .createQueryBuilder('comments')
        .innerJoinAndSelect('comments.user', 'user')
        .innerJoinAndSelect('comments.qtBoard', 'qtBoard')
        .where('comments.id = :Id', { Id: commentId })
        .getOne();
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });
      const { id, depth, qtBoard, ...rest } = selectComment;
      const updateQtBoard = await queryRunner.manager.findOne(QtBoard, {
        id: qtBoard.id,
      });

      const createQtBoard = await this.qtBoardRepository.create({
        ...updateQtBoard,
        commentsCount: updateQtBoard.commentsCount + 1,
      });
      const createReco = await this.commentsRepository.create({
        contents: contents,
        parent: id,
        depth: depth + 1,
        qtBoard: createQtBoard,
        user: user,
      });
      await queryRunner.manager.save(createQtBoard);
      await queryRunner.manager.save(createReco);
      await queryRunner.commitTransaction();
      console.log(createReco);
      return createReco;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //베스트 답변 고르기
  async select({ currentuser, commentId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const selectComment = await this.commentsRepository
        .createQueryBuilder('comments')
        .innerJoinAndSelect('comments.user', 'user')
        .innerJoinAndSelect('comments.qtBoard', 'qtBoard')
        .where('comments.id = :Id', { Id: commentId })
        .getOne();
      console.log(selectComment);
      const post = await this.qtBoardRepository
        .createQueryBuilder('qtBoard')
        .innerJoinAndSelect('qtBoard.user', 'user')
        .where('qtBoard.id = :Id', { Id: selectComment.qtBoard.id })
        .andWhere('user.id = :userId', { userId: currentuser.id })
        .getOne();
      console.log(post);
      if (!post) throw new UnprocessableEntityException('본인이 아닙니다.');
      //Pick 상태로 바꾸어주기
      if (selectComment.isPick === 0) {
        const pick = { ...selectComment, isPick: 1 };
        const result = await this.commentsRepository.create(pick);
        //포인트 플러스해주기~~
        const commentUser = await queryRunner.manager.findOne(User, {
          id: selectComment.user.id,
        });

        const plusPoint = this.userRepository.create({
          ...commentUser,
          point: commentUser.point + 200,
          answerCount: commentUser.answerCount + 1,
        });

        const pointHistory = this.walletRepository.create({
          division: '획득',
          description: '답변이 선택되었습니다.',
          point: +200,
          user: plusPoint,
        });
        await queryRunner.manager.save(plusPoint);
        await queryRunner.manager.save(pointHistory);
        await queryRunner.manager.save(result);

        await queryRunner.commitTransaction();
        return result;
      } else {
        const result = await this.commentsRepository.create({
          ...selectComment,
          isPick: 0,
        });
        await queryRunner.manager.save(result);
        const commentUser = await queryRunner.manager.findOne(User, {
          id: selectComment.user.id,
        });
        const plusPoint = this.userRepository.create({
          ...commentUser,
          point: commentUser.point - 200,
          answerCount: commentUser.answerCount - 1,
        });
        const pointHistory = this.walletRepository.create({
          division: '취소',
          description: '답변이 선택이 취소되었습니다.',
          point: -200,
          user: plusPoint,
        });
        await queryRunner.manager.save(plusPoint);
        await queryRunner.manager.save(pointHistory);
        await queryRunner.commitTransaction();
        return result;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
