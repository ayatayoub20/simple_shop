import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/types/declartion-mergin';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule,
     // Register JWT module using async config
    JwtModule.registerAsync({
      global: true,
      // useFactory runs when the module is loaded
      // it returns the final configuration for JWT
      useFactory: (configService: ConfigService <EnvVariables>) => ({
        // Get secret key from .env file
        // If not found, use 'secretKey' as default
        secret: configService.getOrThrow('JWT_SECRET') || 'secretKey',
      }),
      // Tell NestJS to inject ConfigService into useFactory
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
