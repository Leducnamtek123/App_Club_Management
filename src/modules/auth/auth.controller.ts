import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth } from '../../decorators/http.decorators';
import { ApiFile } from '../../decorators/swagger.schema';
import { Reference } from '../../types';
import { UserDto } from '../user/dtos/user.dto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { LogoutResponseDto } from './dto/user-logout.response.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ZaloLoginDto } from './dto/zalo-login.dto';
import { RegisterZaloDto } from './dto/user-zalo-register.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    const userEntity = await this.authService.validateUser(userLoginDto);

    const authsToken = await this.authService.createAuthTokens({
      userId: userEntity.id,
      role: userEntity.role,
    });

    return new LoginPayloadDto(userEntity.toDto(), authsToken);
  }

  @Post('zalo-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập cho Zalo Mini App' })
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token for Zalo Mini App',
  })
  async zaloLogin(
    @Body() zaloLoginDto: ZaloLoginDto,
  ): Promise<LoginPayloadDto> {
    const userEntity = await this.authService.validateZaloUser(
      zaloLoginDto.accessToken,
    );
    const authsToken = await this.authService.createAuthTokens({
      userId: userEntity.id,
      role: userEntity.role,
    });
    return new LoginPayloadDto(userEntity.toDto(), authsToken);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
  @ApiBody({ type: UserRegisterDto, description: 'Data to register user' })
  @ApiFile({ name: 'avatar' })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
    @UploadedFile() file?: Reference<Express.Multer.File>,
  ): Promise<UserDto> {
    const createdUser = await this.userService.createUser(userRegisterDto, file);
    return createdUser.toDto();
  }
  @Post('change-password')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Password changed successfully' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.updatePassword(
      changePasswordDto.userId,
      changePasswordDto.newPassword,
    );

    return { message: 'Password changed successfully' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Refresh Access Token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Post('logout')
  @Auth() // Only authenticated users can logout
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LogoutResponseDto,
    description: 'User logged out successfully',
  })
  async userLogout(@AuthUser() user: UserEntity): Promise<LogoutResponseDto> {
    console.log('user requesting to log out', user);
    await this.authService.logout(user.id);
    return new LogoutResponseDto('Logged out successfully');
  }

  @Post('auth-zalo')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Password changed successfully' })
  async AuthZalo(@Body() dto: RegisterZaloDto): Promise<void> {
    console.log('ZALO CODE: ', dto.code);
  }

  //   @Post('register/zalo')
  //   @ApiBody({ type: RegisterZaloDto })
  //   @ApiOperation({ summary: 'Register using Zalo OAuth' })
  //   @ApiResponse({
  //     status: 201,
  //     description: 'Register successfully, waiting for approval.',
  //   })
  //   @ApiResponse({
  //     status: 400,
  //     description: "Can't get access_token from zalo!",
  //   })
  //   @ApiResponse({ status: 409, description: 'User already exists!' })
  //   async registerWithZalo(@Body() dto: RegisterZaloDto) {
  //     return this.authService.registerZalo(dto.code, dto.code_verifier);
  //   }

  @Version('1')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN,RoleType.SUPER_ADMIN])
  @ApiOkResponse({ type: UserDto, description: 'current user info' })
  getCurrentUser(@AuthUser() user: UserEntity): UserDto {
    return user.toDto();
  }
}
