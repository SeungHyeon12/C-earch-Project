import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GqlAccessGuard extends AuthGuard('accessToken') {
  getRequest(context: ExecutionContext) {
    const gqlcontext = GqlExecutionContext.create(context);
    return gqlcontext.getContext().req;
  }
}

export class GqlRefreshGuard extends AuthGuard('refreshToken') {
  getRequest(context: ExecutionContext) {
    const gqlcontext = GqlExecutionContext.create(context);
    return gqlcontext.getContext().req;
  }
}
