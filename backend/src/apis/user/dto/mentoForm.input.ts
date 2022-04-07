import { InputType, PickType } from '@nestjs/graphql';
import { MentoInfo } from '../entities/mento.entity';

@InputType()
export class MentorForm extends PickType(
  MentoInfo,
  ['companyName', 'department', 'selfIntro', 'onlineTime'],
  InputType,
) {}
