import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/auth/decorate/currentuser.decorate';
import { IcurrentUser } from '../auth/auth.resolver';
import { Role } from 'src/common/auth/decorate/role.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { RoleGuard } from 'src/common/auth/guard/roleGuard';
import { USER_ROLE } from '../user/entities/user.entity';
import { LectureOrder } from './entities/lectureOrder.entity';
import { LectureOrderService } from './lectureOrder.service';

@Resolver()
export class LectureOrderResolver {
  constructor(private readonly lectureOrderService: LectureOrderService) {}

  @Mutation(() => LectureOrder)
  @UseGuards(GqlAccessGuard)
  async createlecturePayment(
    @Args('lectureRegistrationId') lectureRegistrationId: string,
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.lectureOrderService.create({
      currentUser,
      lectureRegistrationId,
    });
  }

  @Query(() => [LectureOrder])
  @UseGuards(GqlAccessGuard)
  async fetchlectureOrders() {
    return await this.lectureOrderService.findAll();
  }

  @Query(() => LectureOrder)
  @UseGuards(GqlAccessGuard)
  async fetchlectureOrder(
    @Args('lectureorderId') lectureorderId: string,
    @CurrentUser() currentUser: IcurrentUser,
  ) {
    return await this.lectureOrderService.findOne({
      lectureorderId,
      currentUser,
    });
  }

  @UseGuards(GqlAccessGuard, RoleGuard)
  @Role(USER_ROLE.MENTEE)
  @Mutation(() => LectureOrder)
  async updateLectureRegistration(
    @Args('lectureOrderId') lectureOrderId: string,
  ) {
    return await this.lectureOrderService.update({
      lectureOrderId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAccessGuard, RoleGuard)
  @Role(USER_ROLE.MENTEE)
  async deleteLectureOrder(@Args('lectureorderId') lectureorderId: string) {
    return await this.lectureOrderService.delete({ lectureorderId });
  }
}
