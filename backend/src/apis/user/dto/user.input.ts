import { Field, InputType, PickType } from '@nestjs/graphql';

import { User } from '../entities/user.entity';

@InputType()
export class UserForm extends PickType(
  User,
  ['email', 'name', 'phoneNumber', 'gender'],
  InputType,
) {
  @Field(() => String)
  password: string;
}
