import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Comments } from '../comments/entities/comments.entity';
import { User, USER_ROLE } from '../user/entities/user.entity';
import { MembersQtInput } from './dto/membersQtBoard.input';
import { QtBoard } from './entities/qt.entity';
import { Notice } from './entities/notice.entity';
import { JoinQtBoardAndProductCategory } from './entities/qtTags.entity';

interface IFindOne {
  postId: string;
}

interface ICreate {
  currentuser: any;
  memberQtInput: MembersQtInput;
}

interface IUpdate {
  postId: string;
  currentUser: any;
  memberQtInput: MembersQtInput;
}

@Injectable()
export class QtBoardService {
  constructor(
    @InjectRepository(QtBoard)
    private readonly qtBoardRepository: Repository<QtBoard>,
    @InjectRepository(Comments)
    private readonly commentsRepository: Repository<Comments>,
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JoinQtBoardAndProductCategory)
    private readonly qtTagsRepository: Repository<JoinQtBoardAndProductCategory>,
  ) {}

  async findNewPostCount({ date }) {
    const newUser = await this.userRepository.count({
      createdAt: Like(`${date}%`),
    });
    console.log(`newUser: ${newUser}`);
    return newUser;
  }

  //게시글 총 갯수
  async findCount() {
    const count = await this.qtBoardRepository.count();
    return count;
  }

  //게시판 보기
  async findAll({ page }) {
    const findAllPost = await this.qtBoardRepository.find({
      take: 10, // 한 페이지에 10개
      skip: 10 * (page - 1),
      order: { createdAt: 'DESC' },
      relations: ['comments', 'likes', 'user', 'qtTags'],
    });
    return findAllPost;
  }

  //게시글 1개 보기
  async findOne({ postId }: IFindOne) {
    return await this.qtBoardRepository.findOne({
      where: { id: postId },
      relations: ['user', 'likes', 'qtTags'],
    });
  }

  //공지사항 10개 가져오기
  async findNoticeAll(page) {
    const findNotice = await this.noticeRepository.find({
      where: { isNotice: true },
      take: 10, // 한 페이지에 10개
      skip: 10 * (page - 1),
    });
    return findNotice;
  }

  async findAllNoticeCount() {
    const findNotice = await this.noticeRepository.count({
      where: { isNotice: true },
    });
    return findNotice;
  }

  //공지사항 1개 보기
  async findNotice({ postId }) {
    const notice = await this.noticeRepository.findOne({
      id: postId,
    });

    return notice;
  }

  //홈화면 좋아요 수가 많은 게시물 10개 가져오기
  async findLikePost() {
    const findLikePost = await this.qtBoardRepository.find({
      take: 10, // 한 페이지에 10개
      order: { likescount: 'DESC' },
      where: { deletedAt: null },
      relations: ['comments', 'likes', 'qtTags'],
    });
    return findLikePost;
  }

  //내가 한 질문 보기
  async findMyQt({ currentuser, page }) {
    const myQts = await this.qtBoardRepository
      .createQueryBuilder('qtBoard')
      .innerJoinAndSelect('qtBoard.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .orderBy('qtBoard.createdAt', 'DESC')
      .limit(15)
      .offset(15 * (page - 1))
      .getMany();

    return myQts;
  }

  async findMyQtComment({ currentuser, page }) {
    const myQts = await this.qtBoardRepository
      .createQueryBuilder('qtBoard')
      .innerJoinAndSelect('qtBoard.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .orderBy('qtBoard.createdAt', 'DESC')
      .getMany();

    const myCo = await this.commentsRepository
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.qtBoard', 'qtBoard')
      .innerJoinAndSelect('comments.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .orderBy('comments.createdAt', 'DESC')
      .limit(15)
      .offset(15 * (page - 1))
      .getMany();
    const array = [...myQts, ...myCo].sort(function (a, b) {
      if (a.createdAt > b.createdAt) return 1;
      if (a.createdAt === b.createdAt) return 0;
      if (a.createdAt < b.createdAt) return 1;
    });
    console.log(array);
    return array;
  }

  //공지사항생성
  async createNotice({ currentUser, title, contents }) {
    const user = await this.userRepository.findOne({ id: currentUser.id });
    if (user.role !== USER_ROLE.ADMIN) {
      throw new UnauthorizedException('관리자가 아닙니다.');
    }
    const createPost = await this.noticeRepository.save({
      title: title,
      contents: contents,
      isNotice: true,
      user: user,
    });
    console.log(createPost);
    return createPost;
  }

  //비회원 게시글 생성
  async nonMemberCreate({ nonMembersQtInput }) {
    const { password, qtTags, ...userInfo } = nonMembersQtInput;
    if (password.length < 4) {
      throw new UnprocessableEntityException('4글자 이상 입력해주세요');
    }
    const tags = [];
    for (let i = 0; i < qtTags.length; i++) {
      const tagname = qtTags[i].replace('#', '');

      //존재하지 않는 태그라면
      const newTag = await this.qtTagsRepository.save({
        tagname: tagname,
      });
      tags.push(newTag);
    }
    const hashedPassword = await bcrypt.hash(String(password), 1); // 해쉬로 비밀번호 바꿔서 저장
    nonMembersQtInput = {
      ...userInfo,
      qtTags: tags,
      password: hashedPassword,
    };
    const result = await this.qtBoardRepository.save({ ...nonMembersQtInput });
    console.log('create:', result);
    return result;
  }

  //회원 게시글 생성
  async create({ currentuser, memberQtInput }: ICreate) {
    const user = await this.userRepository.findOne({ id: currentuser.id });
    const { qtTags, ...rest } = memberQtInput;
    console.log('💕', qtTags);
    const tags = [];
    for (let i = 0; i < qtTags.length; i++) {
      const tagname = qtTags[i].replace('#', '');
      console.log('📅', tagname);
      //존재하지 않는 태그라면

      const newTag = await this.qtTagsRepository.save({
        tagname: tagname,
      });
      tags.push(newTag);
    }
    console.log('😊', user.name);
    const createPost = await this.qtBoardRepository.save({
      ...rest,
      name: user.name,
      user: user,
      qtTags: tags,
    });
    console.log(createPost);
    return createPost;
  }

  //공지사항 수정
  async updateNotice({ currentUser, postId, title, contents }) {
    const user = await this.userRepository.findOne({ id: currentUser.id });
    if (user.role !== USER_ROLE.ADMIN) {
      throw new UnauthorizedException('관리자가 아닙니다.');
    }
    const post = await this.noticeRepository.findOne({ id: postId });
    const newPost = {
      ...post,
      title: title,
      contents: contents,
    };
    const result = await this.noticeRepository.save(newPost);

    return result;
  }

  //비회원 게시글 수정
  async nonMembersUpdate({ postId, nonMembersQtInput }) {
    const { password, qtTags, ...userInfo } = nonMembersQtInput;
    const post = await this.qtBoardRepository.findOne({ id: postId });
    // const hashedPassword = await bcrypt.hash(String(password), 1);
    console.log(post);
    const passwordCheck = await bcrypt.compare(password, post.password);
    console.log('passwordCheck : ', passwordCheck);
    if (!passwordCheck) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }
    await this.qtTagsRepository.softDelete({
      qtBoard: postId,
    });
    const tags = [];
    for (let i = 0; i < qtTags.length; i++) {
      const tagname = qtTags[i].replace('#', '');
      console.log('📅', tagname);
      const newTag = await this.qtTagsRepository.save({
        tagname: tagname,
      });
      tags.push(newTag);
    }
    const newPost = {
      ...post,
      ...nonMembersQtInput,
      qtTags: tags,
      password: post.password,
    };
    const result = await this.qtBoardRepository.save(newPost);
    console.log(result);
    return result;
  }

  //회원 게시글 수정
  async update({ currentUser, postId, memberQtInput }: IUpdate) {
    const post = await getConnection()
      .createQueryBuilder(QtBoard, 'qtBoard')
      .innerJoinAndSelect('qtBoard.user', 'user')
      .where('user.id = :userId', { userId: currentUser.id })
      .andWhere('qtBoard.id = :Id', { Id: postId })
      .getOne();

    await this.qtTagsRepository.softDelete({
      qtBoard: { id: postId },
    });
    if (post) {
      const { qtTags, ...rest } = memberQtInput;
      console.log('💕', qtTags);
      const tags = [];
      for (let i = 0; i < qtTags.length; i++) {
        const tagname = qtTags[i].replace('#', '');
        console.log('📅', tagname);

        const newTag = await this.qtTagsRepository.save({
          tagname: tagname,
        });
        tags.push(newTag);
      }
      const newPost = {
        ...post,
        ...memberQtInput,
        qtTags: tags,
      };
      const result = await this.qtBoardRepository.save(newPost);
      return result;
    } else {
      throw new UnauthorizedException('내가 쓴 게시글이 아닙니다');
    }
  }

  //관리자 데이타 삭제
  async deleteNotice({ currentUser, postId }) {
    const user = await this.userRepository.findOne({ id: currentUser.id });
    if (user.role !== USER_ROLE.ADMIN) {
      throw new UnauthorizedException('관리자가 아닙니다.');
    }
    const post = await this.noticeRepository.findOne({ id: postId });
    console.log(post);
    if (post) {
      await this.noticeRepository.softDelete({
        id: postId,
      });
      return true;
    } else {
      return false;
    }
  }

  //비회원 게시글 삭제
  async nonMembersdelete({ postId, password }) {
    const post = await this.qtBoardRepository.findOne({ id: postId });
    const passwordCheck = await bcrypt.compare(password, post.password);
    console.log('passwordCheck : ', passwordCheck);
    if (!passwordCheck) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }
    const deleteTags = await this.qtTagsRepository.softDelete({
      qtBoard: postId,
    });

    const deletePost = await this.qtBoardRepository.softDelete({
      id: postId,
    });

    const delteteComment = await this.commentsRepository.softDelete({
      qtBoard: postId,
    });

    if (!delteteComment) return deletePost.affected ? true : false;
    console.log(delteteComment);
    return deleteTags.affected && deletePost.affected ? true : false;
  }

  //회원 게시글 삭제
  async delete({ currentuser, postId }) {
    const deletePost = await getConnection()
      .createQueryBuilder(QtBoard, 'qtBoard')
      .innerJoinAndSelect('qtBoard.user', 'user')
      .where('user.id = :userId', { userId: currentuser.id })
      .andWhere('qtBoard.id = :Id', { Id: postId })
      .getOne();
    if (deletePost) {
      await this.qtTagsRepository.softDelete({
        qtBoard: postId,
      });
      await this.qtBoardRepository.softDelete({
        id: postId,
      });
      await this.commentsRepository.softDelete({
        qtBoard: postId,
      });
      return true;
    } else {
      return false;
    }
  }
}
