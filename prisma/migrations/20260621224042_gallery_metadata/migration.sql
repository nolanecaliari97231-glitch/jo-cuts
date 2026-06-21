/*
  Warnings:

  - Added the required column `title` to the `gallery_images` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_gallery_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alt" TEXT,
    "focus" TEXT DEFAULT '50% 40%',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_gallery_images" ("alt", "created_at", "id", "sort_order", "url") SELECT "alt", "created_at", "id", "sort_order", "url" FROM "gallery_images";
DROP TABLE "gallery_images";
ALTER TABLE "new_gallery_images" RENAME TO "gallery_images";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
