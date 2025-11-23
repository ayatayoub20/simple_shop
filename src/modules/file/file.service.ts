import { Inject, Injectable } from '@nestjs/common';
import ImageKit, { toFile } from '@imagekit/nodejs'; 
import { imageKitToken  } from './imagekit.provider';
import { StorageEngine } from 'multer';
import { Prisma } from 'generated/prisma';
import { TransactionClient } from 'src/types/util.types';
import { SideEffectQueue } from 'src/utils/side-effects';

@Injectable()
export class FileService {
      constructor(@Inject(imageKitToken) private imagekit: ImageKit) {}

    imageKitMulterStorage() {
    const imageKitStorage: StorageEngine = {
      _handleFile: (req, file, cb) => {
        toFile(file.stream)
          .then((fileData) =>
            this.imagekit.files
              .upload({
                file: fileData,
                fileName: file.originalname,
                folder: 'products',
                useUniqueFileName: true,
              })
              .then((res) => {
                cb(null, res);
              }),
          )
          .catch(cb);
      },
     _removeFile: (req, file, cb) => {
  if (!file.fileId) return cb(null); 
  this.imagekit.files
    .delete(file.fileId)
    .then(() => cb(null))  // success
    .catch(cb);             // error
},

    };
    return imageKitStorage;
  }

  
  createFileAssetData(
    file: Express.Multer.File,
    userId: number | bigint,
  ): Prisma.AssetUncheckedCreateInput {
    return {
      fileId: file.fileId!,
      fileSizeInKB: Math.floor(file.size / 1024),
      url: file.url!,
      ownerId: userId,
      fileType: file.mimetype,
    };
  }

async deleteProductAsset(
    prismaTX: TransactionClient,
    productId: number,
    userId: number,
    sideEffects: SideEffectQueue,
  ) {
    const whereClause = {
      where: {
        productId,
        ownerId: userId,
      },
    };
    const existingAssets = await prismaTX.asset.findMany(whereClause);

    await prismaTX.asset.deleteMany(whereClause);

    existingAssets.forEach((asset) => {
      sideEffects.add('delete imagekit file', async () => {
        await this.imagekit.files.delete(asset.fileId);
      });
    });
  }
  deleteFileFromImageKit(fileId: string) {
    return this.imagekit.files.delete(fileId);
  }
}
