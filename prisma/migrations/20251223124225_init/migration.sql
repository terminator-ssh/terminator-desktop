-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "keySalt" TEXT NOT NULL,
    "authSalt" TEXT,
    "encryptedMasterKey" TEXT NOT NULL,
    "loginHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EncryptedBlob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blob" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" TEXT
);
