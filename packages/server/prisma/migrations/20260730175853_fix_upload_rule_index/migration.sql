-- DropIndex
DROP INDEX "UploadRule_category_extension_key";

-- CreateIndex
CREATE INDEX "UploadRule_category_extension_idx" ON "UploadRule"("category", "extension");
