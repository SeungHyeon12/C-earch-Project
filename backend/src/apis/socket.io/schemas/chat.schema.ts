import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatLogDocument = ChatLog & Document;

@Schema()
export class ChatLog {
  @Prop()
  roomId: string;

  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  chat: string;

  @Prop()
  created: Date;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
