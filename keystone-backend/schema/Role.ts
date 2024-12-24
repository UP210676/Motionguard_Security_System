import { allowAll } from '@keystone-6/core/access';
import { text, relationship } from '@keystone-6/core/fields';

export const role = {
  access: allowAll,
  fields: {
    name: text({ validation: { isRequired: true } }),
    users: relationship({ ref: 'User.userRole', many: true }),  // Relación inversa con User
  },
};
