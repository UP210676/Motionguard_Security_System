import { allowAll } from '@keystone-6/core/access';
import { text, relationship, timestamp, select } from '@keystone-6/core/fields';

export const notification = {
access: allowAll,
  fields: {
    notificationId: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    recipient: relationship({ ref: 'User' }),
    notificationType: select({
      options: [
        { label: 'Push', value: 'push' },
        //{ label: 'Email', value: 'email' },
      ],
    }),
    status: select({
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
    }),
    timestamp: timestamp(),
    message: text(),
  },
};