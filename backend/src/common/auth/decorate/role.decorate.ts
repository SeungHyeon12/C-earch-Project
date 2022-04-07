import { SetMetadata } from '@nestjs/common';
import { USER_ROLE } from 'src/apis/user/entities/user.entity';

export const Role = (...roles: USER_ROLE[]) => SetMetadata('roles', roles);
