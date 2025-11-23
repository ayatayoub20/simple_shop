/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDTO, RegisterDTO ,  UserResponseDTO} from './dto/auth.dto';
import type { Request } from 'express';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { registerValidationSchema } from './util/auth-validation.schema';
import { IsPublic } from 'src/decorators/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('register')
  @IsPublic()
 create(@Body(new ZodValidationPipe(registerValidationSchema)) registerDTO: RegisterDTO) : Promise<UserResponseDTO> {
    return this.authService.reigister(registerDTO);
  }

   @Post('login')
   @IsPublic()
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

    @Get('validate')
  // TODO: add guard here later
  validate(@Req() request: Request): UserResponseDTO {
    return this.authService.validate(request.user!);
  }
 
}
