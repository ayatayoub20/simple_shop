/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
import ImageKit from "@imagekit/nodejs";
import { UserResponseDTO } from "src/modules/auth/dto/auth.dto";

export type EnvVariables = {
  JWT_SECRET: string;
  IMAGEKIT_SECRET_KEY: string;
  IMAGEKIT_PUBLIC_KEY:string;
  IMAGEKIT_URL_ENDPOINT:string;
  NODE_ENV: 'development' | 'production';
};

declare global{
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Multer {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface File extends ImageKit.Files.FileUploadResponse {}
    }
        interface Request {
            user?:UserResponseDTO['user'];
        }
    }
    namespace NodeJS {
        interface ProcessEnv extends EnvVariables {}    
    }
    interface BigInt {
    toJSON(): string;
  }  
}
