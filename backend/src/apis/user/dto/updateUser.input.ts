import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserForm {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;
}
