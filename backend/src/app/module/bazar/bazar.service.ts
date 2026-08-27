import { cloudinary } from "../../lib/cloudinary";

export const uploadReceipt = async (buffer: Buffer) => {
  const b64 = Buffer.from(buffer).toString("base64");
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${b64}`,
    { folder: "messmate/receipts" },
  );
  return result.secure_url;
};
