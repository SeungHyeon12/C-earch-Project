import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface ICurrentUser {
  //jwt access storagy 파일의 validate 값들의 타입 지정
  id: string;
  email: string;
  role: string;
}
export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx).getContext().req;
    const user = context.user;
    return user;
  },
);
