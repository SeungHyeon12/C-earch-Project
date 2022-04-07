import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const gqlContextUser =
      GqlExecutionContext.create(context).getContext().req.user;

    return (
      gqlContextUser &&
      gqlContextUser.role &&
      roles.includes(gqlContextUser.role)
    );
  }
}
