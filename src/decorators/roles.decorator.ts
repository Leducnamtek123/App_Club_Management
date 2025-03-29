import { SetMetadata } from '@nestjs/common';
import type { RoleType } from '../constants/role-type';

// Define a constant key for roles metadata
export const ROLES_KEY = 'roles';

// Create Roles decorator to set metadata
export const Roles = (roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
