-- Corriger index uniques client (évite échec migration si emails dupliqués)
DROP INDEX IF EXISTS "clients_email_key";
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email") WHERE "email" IS NOT NULL;

DROP INDEX IF EXISTS "clients_google_id_key";
CREATE UNIQUE INDEX "clients_google_id_key" ON "clients"("google_id") WHERE "google_id" IS NOT NULL;

-- Tarifs mis à jour
UPDATE "services" SET "price" = 15 WHERE "name" = 'Coupe classique';
UPDATE "services" SET "price" = 20 WHERE "name" = 'Coupe + barbe';

-- Sécuriser la table messages si migration client précédente a échoué
DO $$ BEGIN
  CREATE TYPE "MessageSender" AS ENUM ('staff', 'client', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "appointment_messages" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointment_messages_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "appointment_messages"
    ADD CONSTRAINT "appointment_messages_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Colonnes client Google si migration précédente partielle
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL;
