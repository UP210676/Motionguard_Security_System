import { type Lists } from '.keystone/types';
import { authentication } from './Authentication';
import { azureADIntegration } from './AzureADIntegration';
import { user } from './User';
import { cameraDevice } from './CameraDevice';
import { notification } from './Notification';
import { role } from './Role';
import { fileStorage } from './FileStorage';
import { accessControl } from './AccessControl';

export const lists = {
  Authentication: authentication,
  AzureADIntegration: azureADIntegration,
  User: user,
  CameraDevice: cameraDevice,
  Notification: notification,
  Role: role,
  FileStorage: fileStorage,
  AccessControl: accessControl,
} satisfies Lists;

