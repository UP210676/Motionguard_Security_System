import { list } from '@keystone-6/core';
import { text, relationship, timestamp } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';

export const eventLog = list({
  access: allowAll,
  fields: {
    eventType: text({ validation: { isRequired: true } }),  // Por ejemplo: 'motion_detected', 'camera_error', etc.
    timestamp: timestamp({ validation: { isRequired: true } }),
    description: text(),  // Descripción opcional del evento
    camera: relationship({ ref: 'CameraDevice.events', many: false }),  // Relación hacia CameraDevice
  },
});
