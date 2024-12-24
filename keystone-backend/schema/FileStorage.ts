import { allowAll } from '@keystone-6/core/access';
import { text, relationship, timestamp, select } from '@keystone-6/core/fields';

export const fileStorage = {
  access: allowAll,
  fields: {
    fileId: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    filePath: text({ validation: { isRequired: true } }), // Ruta en Azure Blob
    fileType: select({
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
    }),
    capturedAt: timestamp(), // Timestamp de captura
    //relatedEvent: relationship({ ref: 'EventLog.files', many: false }), // Relación con el evento relacionado
  },
};
