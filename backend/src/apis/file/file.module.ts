import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateImage } from '../certificateImage/entities/certificate.entity';
import { LectureImage } from '../LectureImage/entities/lectureImage.entity';
import { LectureProduct } from '../lectureProduct/entities/lectureProduct.entity';
import { LectureProductCategory } from '../lectureproductCategory/entities/lectureproductCategory.entity';
import { PostImage } from '../postImage/entities/postImage.entity';
import { QtBoard } from '../QtBoard/entities/qt.entity';
import { MentoInfo } from '../user/entities/mento.entity';
import { User } from '../user/entities/user.entity';
import { FileUploadResolver } from './file.resolver';
import { FileUploadService } from './file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LectureImage, //
      LectureProduct,
      LectureProductCategory,
      PostImage,
      QtBoard,
      CertificateImage,
      MentoInfo,
    ]),
  ],
  providers: [
    FileUploadResolver, //
    FileUploadService,
  ],
})
export class FileUploadModule {}
