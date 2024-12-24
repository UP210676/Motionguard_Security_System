import { allowAll } from '@keystone-6/core/access';
import { relationship, select, text } from '@keystone-6/core/fields';

export const accessControl = {
  access: allowAll,
  fields: {
    accessId: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    user: relationship({ ref: 'User' }),
    camera: relationship({ ref: 'CameraDevice' }),
    permissionLevel: select({
      options: [
        { label: 'View Only', value: 'view_only' },
        { label: 'Edit', value: 'edit' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'view_only',
    }),
  },
};
