import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RoleType } from '../constants/role-type.ts';
import type { UserEntity } from '../modules/user/user.entity.ts';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RoleType[] | undefined>(
      'roles',
      context.getHandler(),
    );

    console.log('Required roles:', roles);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    console.log('Request user:', user);

    const hasRole = roles.includes(user.role);
    console.log('User role:', user.role, 'Has role:', hasRole);

    return roles.includes(user.role);
  }
}
