-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "userRole" TEXT,
    "tenant" TEXT NOT NULL DEFAULT '',
    "profilePicture" TEXT NOT NULL DEFAULT '',
    "adAuthenticationStatus" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_userRole_fkey" FOREIGN KEY ("userRole") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("adAuthenticationStatus", "email", "fullName", "id", "phoneNumber", "profilePicture", "userRole") SELECT "adAuthenticationStatus", "email", "fullName", "id", "phoneNumber", "profilePicture", "userRole" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE INDEX "User_userRole_idx" ON "User"("userRole");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
