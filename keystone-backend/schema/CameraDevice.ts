import { allowAll } from '@keystone-6/core/access';
import { text, relationship, timestamp, select } from '@keystone-6/core/fields';

export const cameraDevice = {
  access: allowAll,
  fields: {
    cameraId: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    status: select({
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'active',
    }),
    lastActive: timestamp(),
    events: relationship({ ref: 'EventLog.camera', many: true }), // Relación con el registro de eventos
  },
};
