import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class MembersQtInput {
  @Field(() => String)
  title!: string;

  @Field(() => String)
  contents!: string;

  @Field(() => [String])
  qtTags: string[];
}
