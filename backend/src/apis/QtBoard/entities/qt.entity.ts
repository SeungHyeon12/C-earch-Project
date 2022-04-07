import { Int, Field, ObjectType } from '@nestjs/graphql';
import { Comments } from 'src/apis/comments/entities/comments.entity';
import { Likes } from 'src/apis/likes/entities/likes.entity';
import { PostImage } from 'src/apis/postImage/entities/postImage.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JoinQtBoardAndProductCategory } from './qtTags.entity';

@Entity()
@ObjectType()
export class QtBoard {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id!: string;

  @Column()
  @Field(() => String)
  title!: string;

  @Column({ type: 'longtext' })
  @Field(() => String)
  contents!: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  name: string;

  @Column({ default: 0 })
  @Field(() => Int)
  point: number;

  @Column({ default: 0 })
  @Field(() => Int)
  likescount: number;

  @Column({ default: 0 })
  @Field(() => Int)
  commentsCount: number;

  @Column({ default: 0 })
  // @Field(() => String)
  password: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt!: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.qtBoard, { nullable: true })
  @Field(() => User)
  user: User;

  @OneToMany(() => Comments, (comments) => comments.qtBoard, { nullable: true })
  @Field(() => [Comments], { nullable: true })
  comments: Comments[];

  @OneToMany(() => Likes, (likes) => likes.qtBoard, { nullable: true })
  @Field(() => [Likes], { nullable: true })
  likes?: Likes[];

  @OneToMany(() => PostImage, (postImage) => postImage.qtBoard, {
    nullable: true,
  })
  @Field(() => [PostImage])
  image: PostImage[];

  @OneToMany(
    () => JoinQtBoardAndProductCategory,
    (category) => category.qtBoard,
    {
      nullable: true,
    },
  )
  @Field(() => [JoinQtBoardAndProductCategory], { nullable: true })
  qtTags: JoinQtBoardAndProductCategory[];
}
