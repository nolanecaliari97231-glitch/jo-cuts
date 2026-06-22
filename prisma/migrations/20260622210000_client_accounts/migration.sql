-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('staff', 'client', 'system');

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "clients" ADD COLUMN "google_id" TEXT;
ALTER TABLE "clients" ADD COLUMN "avatar_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_google_id_key" ON "clients"("google_id");
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateTable
CREATE TABLE "appointment_messages" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointment_messages" ADD CONSTRAINT "appointment_messages_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
