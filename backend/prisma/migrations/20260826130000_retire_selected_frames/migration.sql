UPDATE "frames"
SET "is_active" = false,
    "deleted_at" = CURRENT_TIMESTAMP
WHERE "name" IN ('Playful Fashion', 'Modern Fashion', 'Green Scrapbook', 'Pink Home Decor');
