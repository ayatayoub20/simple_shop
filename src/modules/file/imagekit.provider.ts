import ImageKit from "imagekit";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "src/types/declartion-mergin";


export const imageKitToken = 'ImageKitProvider';
export const ImageKitProvider = {
  provide: imageKitToken,
  useFactory: (configService: ConfigService<EnvVariables>) => {
    return new ImageKit({
  publicKey: configService.getOrThrow('IMAGEKIT_PUBLIC_KEY'),
  privateKey: configService.getOrThrow('IMAGEKIT_SECRET_KEY'),
  urlEndpoint: configService.getOrThrow('IMAGEKIT_URL_ENDPOINT'),
});

  },
  inject: [ConfigService],
};
