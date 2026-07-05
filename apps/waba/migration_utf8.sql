-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "sender_number" TEXT NOT NULL,
    "last_interaction_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contact_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "ad_source" TEXT,
    "assigned_to" TEXT,
    "department" TEXT NOT NULL DEFAULT 'UNASSIGNED',

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "message_id" TEXT,
    "sender_number" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "message_content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DELIVERED',
    "media_url" TEXT,
    "media_type" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailedApiCall" (
    "id" SERIAL NOT NULL,
    "payload" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedApiCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sender_number_key" ON "Conversation"("sender_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Message_message_id_key" ON "Message"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_number_fkey" FOREIGN KEY ("sender_number") REFERENCES "Conversation"("sender_number") ON DELETE RESTRICT ON UPDATE CASCADE;

