import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  ICurrentUser,
} from 'src/common/auth/decorate/currentuser.decorate';
import { GqlAccessGuard } from 'src/common/auth/guard/gqlAuthGuard';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';

@Resolver()
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(GqlAccessGuard)
  @Query(() => [Wallet])
  async fetchMyPlusWallet(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.walletService.findPlus({ currentUser });
  }

  @UseGuards(GqlAccessGuard)
  @Query(() => [Wallet])
  async fetchMyMinusWallet(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.walletService.findMinus({ currentUser });
  }
}
