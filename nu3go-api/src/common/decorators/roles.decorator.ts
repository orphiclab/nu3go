import { SetMetadata } from '@nestjs/common';

export type Role =
    | 'super_admin'
    | 'admin'
    | 'kitchen_staff'
    | 'delivery_manager'
    | 'customer'
    | 'corporate_admin';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
