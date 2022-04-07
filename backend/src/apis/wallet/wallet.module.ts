import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [WalletResolver, WalletService],
})
export class WalletModule {}
