import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketGateway } from 'src/common/socketutils/websocket.gateway';
import { SocketResolver } from './resolver.socket';
import { ChatLog, ChatLogSchema } from './schemas/chat.schema';
import { ChatRoom, ChatRoomSchema } from './schemas/room.schema';
import { ChatUser, ChatUserSchema } from './schemas/user.schema';
import { SocketService } from './service.socket';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatLog.name, schema: ChatLogSchema },
      { name: ChatUser.name, schema: ChatUserSchema },
    ]),
  ],
  providers: [SocketService, SocketResolver, SocketGateway],
})
export class SocketModule {}
