import { allowAll } from '@keystone-6/core/access';
import { text, checkbox, relationship } from '@keystone-6/core/fields';

export const user = {
  access: allowAll,
  fields: {
    fullName: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: true } }),
    phoneNumber: text({ validation: { isRequired: true } }),
    userRole: relationship({ ref: 'Role.users' }),  // Relación con Role
    tenant: text({ validation: { isRequired: true } }),
    profilePicture: text(),
    adAuthenticationStatus: checkbox(),
  },
};
