import multer from "multer";
import { MAX_RECEIPT_SIZE } from "../utils/constants";
import { AppError } from "../utils/AppError";
const storage = multer.memoryStorage();
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new AppError(400, "Images only") as any, false);
};
export const uploadSingle = (fieldName: string) =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_RECEIPT_SIZE },
  }).single(fieldName);
