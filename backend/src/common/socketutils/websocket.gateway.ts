import { ConflictException, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from 'src/apis/socket.io/service.socket';
import { WsGuard } from '../auth/guard/wsGuard';
import * as jwt from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    name: string;
  }
}

@WebSocketGateway(5000, {
  cors: {
    origin: process.env.SOCKET_GATEWAY_ORIGIN,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  server: Server;

  public async handleConnection(client: Socket) {
    const bearerToken = client.handshake.headers.authorization.replace(
      'Bearer ',
      '',
    );
    try {
      const result = <jwt.JwtPayload>(
        jwt.verify(bearerToken, process.env.ACCESS_KEY_TOKEN)
      );
      client.data.id = result.sub;
      client.data.name = result.name;

      console.log('testing : ', result.name);
      await this.socketService.updateSocketId({
        socketId: client.id,
        id: result.sub,
        name: result.name,
      });

      console.log(`${client.id} Hi~~`);
    } catch (error) {
      this.server.to(client.id).emit('login expired', 'expired');
      throw new ConflictException('token validate not fine');
    }
  }

  public handleDisconnect(client: Socket) {
    console.log(`${client.id} Bye~~`);
    //this.server.emit('leave', { id: client.id });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('client message')
  async sendMessage(client: Socket, message: any) {
    console.log(message);
    await this.socketService.saveLog({
      roomId: message.roomNum,
      id: client.data.id,
      name: client.data.name,
      chat: message.message,
    });
    const clientMessage = JSON.stringify({
      message: message.message,
      userName: client.data.name,
    });
    this.server.to(message.roomNum).emit('server message', clientMessage);
  }

  @SubscribeMessage('join room')
  async enterChatroom(client: Socket, message: any) {
    client.join(message.roomNum);
    const isRoom = await this.socketService.isUserInRoom({
      roomId: message.roomNum,
      userId: client.data.id,
    });

    if (!isRoom) {
      await this.socketService.createUserAtRoom({
        roomId: message.roomNum,
        userId: client.data.id,
        userName: client.data.name,
        roomName: 'default',
      });
      const joinTemplate = `${client.id} 님이 들어오셨습니다`;
      await this.socketService.saveLog({
        roomId: message.roomNum,
        id: 'alert',
        name: 'alert',
        chat: joinTemplate,
      });
      client.broadcast
        .to(message.roomNum)
        .emit('server message alert', joinTemplate);
      return true;
    }
    const logs = await this.socketService.fetchRoomLog({
      roomId: message.roomNum,
      userId: client.data.id,
    });
    console.log('wls : ', logs);
    this.server.to(client.id).emit('room logs', JSON.stringify(logs));
  }

  @SubscribeMessage('leave room')
  async leaveChatroom(client: Socket, message: any) {
    await this.socketService.deleteUser({
      roomId: message.roomNum,
      userId: client.data.id,
    });
    const exitTemplate = `${client.id} 님이 나가셨습니다.`;
    client.broadcast
      .to(message.roomNum)
      .emit('server message alert', exitTemplate);
    await this.socketService.saveLog({
      roomId: message.roomNum,
      id: 'alert',
      name: 'alert',
      chat: exitTemplate,
    });
    client.leave(message.roomNum);
  }
}
