import { config } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { authentication } from './schema/Authentication';
import { azureADIntegration } from './schema/AzureADIntegration';
import { user } from './schema/User';
import { cameraDevice } from './schema/CameraDevice';
import { notification } from './schema/Notification';
import { role } from './schema/Role';
import { fileStorage } from './schema/FileStorage';
import { accessControl } from './schema/AccessControl';
import { eventLog } from './schema/EventLog';

const {
  ASSET_BASE_URL: baseUrl = "http://localhost:3000"
} = process.env


export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./db/vivehub.db',
  },
  lists: {
    // Integración de los esquemas
    Authentication: authentication,
    AzureADIntegration: azureADIntegration,
    User: user,
    CameraDevice: cameraDevice,
    Notification: notification,
    Role: role,
    FileStorage: fileStorage,
    AccessControl: accessControl,
    EventLog: eventLog,
  },
  server: {
    cors: {
      origins: "*",
      credentials: true,
    }
  }
});