import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { QtBoard } from '../QtBoard/entities/qt.entity';
import { User } from '../user/entities/user.entity';
import { Likes } from './entities/likes.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
    @InjectRepository(QtBoard)
    private readonly qtBoardRepository: Repository<QtBoard>,

    private readonly connection: Connection,
  ) {}

  async islike({ currentuser, postId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    try {
      const post = await queryRunner.manager.findOne(QtBoard, {
        id: postId,
      });
      console.log(post);
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });
      console.log(user);
      const userLike = await queryRunner.manager.findOne(Likes, {
        qtBoard: post,
        user: user,
      });
      console.log(userLike);
      if (!userLike) return false;
      if (userLike.isLike === true) {
        await queryRunner.commitTransaction();
        return true;
      } else if (userLike.isLike === false) {
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

  async likes({ currentuser, postId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      const post = await queryRunner.manager.findOne(QtBoard, {
        id: postId,
      });
      const user = await queryRunner.manager.findOne(User, {
        id: currentuser.id,
      });

      const userLike = await queryRunner.manager.findOne(Likes, {
        qtBoard: post,
        user: user,
      });
      if (!userLike) {
        const createLike = await this.likesRepository.create({
          qtBoard: post,
          user: user,
          isLike: true,
        });
        const { likescount, ...rest } = post;
        const likePost = await this.qtBoardRepository.create({
          ...rest,
          likescount: likescount + 1,
        });
        await queryRunner.manager.save(createLike);
        await queryRunner.manager.save(likePost);
        await queryRunner.commitTransaction();
        return createLike;
      }
      if (userLike.isLike === true) {
        const dislike = await this.likesRepository.create({
          ...userLike,
          qtBoard: post,
          user: user,
          isLike: false,
        });
        const { likescount, ...rest } = post;
        const dislikePost = await this.qtBoardRepository.create({
          ...rest,
          likescount: likescount - 1,
        });
        await queryRunner.manager.save(dislikePost);
        await queryRunner.manager.save(dislike);
        await queryRunner.commitTransaction();
        return dislike;
      } else {
        const createLike = await this.likesRepository.create({
          ...userLike,
          qtBoard: post,
          user: user,
          isLike: true,
        });
        const { likescount, ...rest } = post;
        const likePost = await this.qtBoardRepository.create({
          ...rest,
          likescount: likescount + 1,
        });
        await queryRunner.manager.save(createLike);
        await queryRunner.manager.save(likePost);
        await queryRunner.commitTransaction();
        return createLike;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
