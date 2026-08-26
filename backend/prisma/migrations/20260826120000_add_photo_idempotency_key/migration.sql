ALTER TABLE "photos" ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "photos_idempotency_key_key" ON "photos"("idempotency_key");
