import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { getConnection, Repository } from 'typeorm';
import { IcurrentUser } from '../auth/auth.resolver';
import { CertificateImage } from '../certificateImage/entities/certificate.entity';
import { LectureImage } from '../LectureImage/entities/lectureImage.entity';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { PostImage } from '../postImage/entities/postImage.entity';
import { QtBoard } from '../QtBoard/entities/qt.entity';
import { MentoInfo } from '../user/entities/mento.entity';
import { User } from '../user/entities/user.entity';

export enum URL_PURPOSE {
  LECTURE = 'LECTURE',
  USER = 'USER',
  QTBOARD = 'QTBOARD',
  CERTIFICATE = 'CERTIFICATE',
}

interface IfileInfo {
  fileNames: string[];
  id: string;
  purpose: URL_PURPOSE;
}

interface IfileToDbUser {
  filePaths: string[];
  user: IcurrentUser;
}

interface IfileToDbLecture {
  filePaths: string[];
  lectureId: string;
}

interface IfileToDbQt {
  filePaths: string[];
  qTId: string;
}

interface IfileToDbMento {
  filePaths: string[];
  user: IcurrentUser;
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESSKEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRETACCESS_KEY,
  region: process.env.AWS_S3_REGION,
  signatureVersion: process.env.AWS_S3_SIGNATUREVERSION,
});

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
    @InjectRepository(LectureImage)
    private readonly lectureImgRepository: Repository<LectureImage>,
    @InjectRepository(LectureProduct)
    private readonly lectureProductRepository: Repository<LectureProduct>,
    @InjectRepository(QtBoard)
    private readonly qTBoardRepository: Repository<QtBoard>,
    @InjectRepository(MentoInfo)
    private readonly mentoInfoRepository: Repository<MentoInfo>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(CertificateImage)
    private readonly certificateImageRepository: Repository<CertificateImage>,
  ) {}

  async putSignedUrl({ fileNames, id, purpose }: IfileInfo) {
    const fileNamesList = fileNames.map((ele) =>
      s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWC_S3_BUCKET,
        Expires: 120,
        Key: `${purpose}/${id}/${ele}`,
      }),
    );
    const result = await Promise.all(fileNamesList);

    console.log('urls : ', result);
    return result;
  }

  async urlToDbUser({ filePaths, user }: IfileToDbUser) {
    const userFind = await this.userRepository.findOne({
      where: { id: user.id },
    });
    const imageUrlList = filePaths.map((filePath) =>
      this.userRepository.save({
        ...userFind,
        imageUrl: filePath,
      }),
    );
    const result = await Promise.all(imageUrlList);
    return result;
  }

  async getSignedUrlUser({ user }) {
    const userFind = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (userFind.imageUrl) {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWC_S3_BUCKET,

        Expires: 120,
        Key: userFind.imageUrl, //img url 추후 문자열처리를 해주어야한다. 우선적으로 진행
      });
      console.log('urls : ', url);
      return url;
    }
    return 'null';
  }
  ////////////////////////
  async getSignedUrlLecture({ lectureId }) {
    const urlList = await getConnection()
      .createQueryBuilder()
      .select('lecture_image')
      .from(LectureImage, 'lecture_image')
      .where('lecture_image.product = :id', { id: lectureId })
      .getMany();

    console.log('querybuilder : ', urlList);

    const fileNamesList = urlList.map((lecture) =>
      s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWC_S3_BUCKET,
        Expires: 120,
        Key: lecture.url, //img url 추후 문자열처리를 해주어야한다. 우선적으로 진행
      }),
    );
    const urls = await Promise.all(fileNamesList);
    return urls;
  }

  async urlToDbLecture({ filePaths, lectureId }: IfileToDbLecture) {
    const lectureFind = await this.lectureProductRepository.findOne({
      where: { id: lectureId },
    });

    await this.lectureImgRepository.softDelete({ id: lectureId });

    const imageUrlList = filePaths.map((filePath) =>
      this.lectureImgRepository.save({
        url: filePath,
        product: lectureFind,
      }),
    );
    const result = await Promise.all(imageUrlList);
    await this.lectureProductRepository.save({
      ...lectureFind,
      image: result,
    });
    return result;
  }
  ////////////////////////////
  async getSignedUrlQt({ qTId }) {
    const urlList = await getConnection()
      .createQueryBuilder()
      .select('post_image')
      .from(PostImage, 'post_image')
      .where('post_image.qtBoard = :id', { id: qTId })
      .getMany();

    console.log('querybuilder : ', urlList);

    const fileNamesList = urlList.map((qT) =>
      s3.getSignedUrlPromise('getObject', {
        Bucket: 'process.env.AWC_S3_BUCKET',
        Expires: 120,
        Key: qT.url, //img url 추후 문자열처리를 해주어야한다. 우선적으로 진행
      }),
    );
    const urls = await Promise.all(fileNamesList);
    return urls;
  }

  async urlToDbQt({ filePaths, qTId }: IfileToDbQt) {
    const qTBoardFind = await this.qTBoardRepository.findOne({
      where: { id: qTId },
    });
    const deleteList = await getConnection()
      .createQueryBuilder()
      .select('post_image')
      .from(PostImage, 'post_image')
      .where('post_image.qtBoard = :id', { id: qTId })
      .getMany();
    console.log('delete List : ', deleteList);

    const imageDeleteList = deleteList.map((ele) =>
      this.postImageRepository.softDelete({ id: ele.id }),
    );
    const deletedImg = await Promise.all(imageDeleteList);
    console.log('deleted : ', deletedImg);

    const imageUrlList = filePaths.map((filePath) =>
      this.postImageRepository.save({
        url: filePath,
        qtBoard: qTBoardFind,
      }),
    );
    const result = await Promise.all(imageUrlList);

    await this.qTBoardRepository.save({
      ...qTBoardFind,
      image: result,
    });
    return result;
  }
  //////////////////////////////////////////////////
  async urlToDbCertificate({ filePaths, user }: IfileToDbMento) {
    const mentoFind = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.mentor', 'mentor')
      .where('user.id = :id', { id: user.id })
      .getOne();
    console.log('usertemp : ', mentoFind);

    const deleteList = await this.certificateImageRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.mento', 'mento')
      .where('mento.id = :id', { id: mentoFind.mentor.id })
      .getMany();

    console.log('img123 : ', deleteList);

    const imageDeleteList = deleteList.map((ele) =>
      this.certificateImageRepository.softDelete({ id: ele.id }),
    );

    const deletedImg = await Promise.all(imageDeleteList);
    console.log('deleted : ', deletedImg);

    const imageUrlList = filePaths.map((filePath) =>
      this.certificateImageRepository.save({
        url: filePath,
        mento: mentoFind.mentor,
      }),
    );
    const result = await Promise.all(imageUrlList);

    await this.mentoInfoRepository.save({
      ...mentoFind.mentor,
      certificate: result,
    });

    return result;
  }

  async getSignedUrlCertification({ mentoId }) {
    const urlList = await getConnection()
      .createQueryBuilder()
      .select('certificate_image')
      .from(CertificateImage, 'certificate_image')
      .where('certificate_image.mento = :id', { id: mentoId })
      .getMany();

    console.log('querybuilder : ', urlList);

    const fileNamesList = urlList.map((certification) =>
      s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWC_S3_BUCKET,
        Expires: 120,
        Key: certification.url, //img url 추후 문자열처리를 해주어야한다. 우선적으로 진행
      }),
    );
    const urls = await Promise.all(fileNamesList);
    return urls;
  }
}
