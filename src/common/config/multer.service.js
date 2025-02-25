import multer from "multer";
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage }).array("image_path", 10);
