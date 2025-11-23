import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import {ImageKitProvider} from './imagekit.provider';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [FileModule],
    useFactory : ( fileServise : FileService )=>{
      // custom storage ro imagekit
      return {
        storage : fileServise.imageKitMulterStorage(),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5 MB
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed!'), false);
          }
        }
      }                                                                                                                                                                                                                                                         
      // validation limits & file filter 
    },
    inject: [FileService],
  }),
  ],
  providers: [FileService , ImageKitProvider],
  exports: [FileService , MulterModule]
})
export class FileModule {}
