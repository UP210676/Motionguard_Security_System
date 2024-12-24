/*
  Warnings:

  - You are about to drop the `Resident` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Resident";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Authentication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL DEFAULT '',
    "associatedUser" TEXT,
    "expirationDate" DATETIME,
    "authenticationType" TEXT,
    "adAuthenticationToken" TEXT NOT NULL DEFAULT '',
    "refreshToken" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Authentication_associatedUser_fkey" FOREIGN KEY ("associatedUser") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AzureADIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adUserId" TEXT NOT NULL DEFAULT '',
    "adTenantId" TEXT NOT NULL DEFAULT '',
    "roleMapping" TEXT NOT NULL DEFAULT '',
    "accessTokenValidity" BOOLEAN NOT NULL DEFAULT false,
    "loginHistory" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "userRole" TEXT,
    "profilePicture" TEXT NOT NULL DEFAULT '',
    "adAuthenticationStatus" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_userRole_fkey" FOREIGN KEY ("userRole") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CameraDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cameraId" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'active',
    "lastActive" DATETIME
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL DEFAULT '',
    "recipient" TEXT,
    "notificationType" TEXT,
    "status" TEXT DEFAULT 'pending',
    "timestamp" DATETIME,
    "message" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Notification_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT '',
    "fileType" TEXT,
    "capturedAt" DATETIME
);

-- CreateTable
CREATE TABLE "AccessControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessId" TEXT NOT NULL DEFAULT '',
    "user" TEXT,
    "camera" TEXT,
    "permissionLevel" TEXT DEFAULT 'view_only',
    CONSTRAINT "AccessControl_user_fkey" FOREIGN KEY ("user") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AccessControl_camera_fkey" FOREIGN KEY ("camera") REFERENCES "CameraDevice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL DEFAULT '',
    "timestamp" DATETIME NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "camera" TEXT,
    CONSTRAINT "EventLog_camera_fkey" FOREIGN KEY ("camera") REFERENCES "CameraDevice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_tokenId_key" ON "Authentication"("tokenId");

-- CreateIndex
CREATE INDEX "Authentication_associatedUser_idx" ON "Authentication"("associatedUser");

-- CreateIndex
CREATE UNIQUE INDEX "AzureADIntegration_adUserId_key" ON "AzureADIntegration"("adUserId");

-- CreateIndex
CREATE INDEX "User_userRole_idx" ON "User"("userRole");

-- CreateIndex
CREATE UNIQUE INDEX "CameraDevice_cameraId_key" ON "CameraDevice"("cameraId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_notificationId_key" ON "Notification"("notificationId");

-- CreateIndex
CREATE INDEX "Notification_recipient_idx" ON "Notification"("recipient");

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_fileId_key" ON "FileStorage"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessControl_accessId_key" ON "AccessControl"("accessId");

-- CreateIndex
CREATE INDEX "AccessControl_user_idx" ON "AccessControl"("user");

-- CreateIndex
CREATE INDEX "AccessControl_camera_idx" ON "AccessControl"("camera");

-- CreateIndex
CREATE INDEX "EventLog_camera_idx" ON "EventLog"("camera");
