-- CreateTable
CREATE TABLE "VoiceRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoiceRoom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceRoomMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoiceRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VoiceRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoiceRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceRoom_slug_key" ON "VoiceRoom"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceRoomMember_roomId_userId_key" ON "VoiceRoomMember"("roomId", "userId");
