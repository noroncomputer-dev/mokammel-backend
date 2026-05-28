import { IUser } from "../models/user.model";

// این export {} فایل رو به یک module تبدیل می‌کنه تا augmentation درست کار کنه
export {};

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
