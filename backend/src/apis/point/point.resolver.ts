import { UseGuards } from '@nestjs/common';
import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  ICurrentUser,
} from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { IamportService } from '../iamport/iamport.service';
import { Point } from './entities/point.entity';
import { PointService } from './point.service';

@Resolver()
export class PointResolver {
  constructor(
    private readonly pointService: PointService,
    private readonly iamportService: IamportService,
  ) {}

  @UseGuards(GqlAccessGuard)
  @Query(() => [Point])
  async fetchMyPointHistory(@CurrentUser() currentuser: ICurrentUser) {
    return await this.pointService.findAllPoint({ currentuser });
  }
  @UseGuards(GqlAccessGuard)
  @Mutation(() => Point)
  async chargePoint(
    @Args('impUid') impUid: string,
    @Args('myamount') myamount: number,
    @CurrentUser() currentuser: ICurrentUser,
  ) {
    const token = await this.iamportService.getIamportToken();

    await this.iamportService.checkPaid({ impUid, myamount, token });

    return await this.pointService.create({ impUid, myamount, currentuser });
  }

  @UseGuards(GqlAccessGuard)
  @Mutation(() => Point)
  async cancelPoint(
    @Args('impUid') impUid: string,
    // @Args('amount') amount: number,
    @CurrentUser() currentuser: ICurrentUser,
  ) {
    const token = await this.iamportService.getIamportToken();

    const cancelAmount = await this.iamportService.getCancel({ impUid, token });
    return await this.pointService.cancel({
      impUid,
      amount: cancelAmount,
      currentuser,
    });
  }
}
