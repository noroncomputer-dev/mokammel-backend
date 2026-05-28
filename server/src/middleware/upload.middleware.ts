import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads/products");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads/avatars");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("فرمت فایل مجاز نیست"));
  }
};

export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("image");

export const uploadAvatarImage = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).single("image");

export const uploadMultipleProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).array("images", 10);
