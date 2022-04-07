import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { IcurrentUser } from '../auth/auth.resolver';
import { CertificateImage } from '../certificateImage/entities/certificate.entity';
import { LectureImage } from '../LectureImage/entities/lectureImage.entity';
import { PostImage } from '../postImage/entities/postImage.entity';
import { User } from '../user/entities/user.entity';
import { FileUploadService, URL_PURPOSE } from './file.service';

@Resolver()
export class FileUploadResolver {
  constructor(
    private readonly fileUploadService: FileUploadService, //
  ) {}

  @Query(() => [String])
  @UseGuards(GqlAccessGuard)
  async putSignedUrlUser(
    @Args({ name: 'fileNames', type: () => [String] }) fileNames: string[], //
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.fileUploadService.putSignedUrl({
      fileNames,
      id: currentUser.id,
      purpose: URL_PURPOSE.USER,
    });
  }

  @Query(() => String)
  @UseGuards(GqlAccessGuard)
  async getSignedUrlUser(
    @CurrentUser() currentUser: IcurrentUser, //
  ) {
    return await this.fileUploadService.getSignedUrlUser({
      user: currentUser,
    });
  }

  @Mutation(() => [User])
  @UseGuards(GqlAccessGuard)
  async urlToDbUser(
    @Args({ name: 'filePaths', type: () => [String] }) filePaths: string[],
    @CurrentUser() currentUser: IcurrentUser, //
  ) {
    return await this.fileUploadService.urlToDbUser({
      filePaths,
      user: currentUser,
    });
  }

  @Query(() => [String])
  @UseGuards(GqlAccessGuard)
  async putSignedUrlLecture(
    @Args({ name: 'fileNames', type: () => [String] }) fileNames: string[], //
    @Args('lectureId') lectureId: string,
  ) {
    return await this.fileUploadService.putSignedUrl({
      fileNames,
      id: lectureId,
      purpose: URL_PURPOSE.LECTURE,
    });
  }

  @Query(() => [String])
  async getSignedUrlLecture(
    @Args('lectureId') lectureId: string, //
  ) {
    return await this.fileUploadService.getSignedUrlLecture({
      lectureId,
    });
  }

  @Mutation(() => [LectureImage])
  async urlToDbLecture(
    @Args({ name: 'filePaths', type: () => [String] }) filePaths: string[],
    @Args('lectureId') lectureId: string, //
  ) {
    return await this.fileUploadService.urlToDbLecture({
      filePaths,
      lectureId,
    });
  }
  ////////////////
  @Query(() => [String])
  @UseGuards(GqlAccessGuard)
  async putSignedUrlQt(
    @Args({ name: 'fileNames', type: () => [String] }) fileNames: string[], //
    @Args('qTId') qTId: string,
  ) {
    return await this.fileUploadService.putSignedUrl({
      fileNames,
      id: qTId,
      purpose: URL_PURPOSE.QTBOARD,
    });
  }

  @Query(() => [String])
  async getSignedUrlLQt(
    @Args('qTId') qTId: string, //
  ) {
    return await this.fileUploadService.getSignedUrlQt({
      qTId,
    });
  }

  @Mutation(() => [PostImage])
  async urlToDbQt(
    @Args({ name: 'filePaths', type: () => [String] }) filePaths: string[],
    @Args('qTId') qTId: string, //
  ) {
    return await this.fileUploadService.urlToDbQt({
      filePaths,
      qTId,
    });
  }
  /////////////////
  @Query(() => [String])
  @UseGuards(GqlAccessGuard)
  async putSignedUrlCertificate(
    @Args({ name: 'fileNames', type: () => [String] }) fileNames: string[], //
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.fileUploadService.putSignedUrl({
      fileNames,
      id: currentUser.id,
      purpose: URL_PURPOSE.CERTIFICATE,
    });
  }

  @Query(() => [String])
  async getSignedUrlCertificate(
    @Args('mentoId') mentoId: string, //
  ) {
    return await this.fileUploadService.getSignedUrlCertification({
      mentoId,
    });
  }

  @Mutation(() => [CertificateImage])
  @UseGuards(GqlAccessGuard)
  async urlToDbCertificate(
    @Args({ name: 'filePaths', type: () => [String] }) filePaths: string[],
    @CurrentUser() currentUser: IcurrentUser, //
  ) {
    return await this.fileUploadService.urlToDbCertificate({
      filePaths,
      user: currentUser,
    });
  }
}
