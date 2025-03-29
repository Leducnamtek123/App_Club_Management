import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import axios from 'axios';
import { validateHash } from '../../common/utils';
import { RoleType } from '../../constants/role-type';
import { TokenType } from '../../constants/token-type';
import { UserStatus } from '../../constants/user-status';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
  ) {}

  async createAccessToken(data: {
    role: RoleType;
    userId: Uuid;
  }): Promise<string> {
    return this.jwtService.signAsync(
      {
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
      },
      { expiresIn: this.configService.authConfig.jwtExpirationTime },
    );
  }

  async createRefreshToken(userId: Uuid): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      { userId, type: TokenType.REFRESH_TOKEN },
      { expiresIn: this.configService.authConfig.jwtRefreshExpirationTime },
    );

    await this.userService.saveRefreshToken(userId, refreshToken);
    return refreshToken;
  }

  async createAuthTokens(data: {
    role: RoleType;
    userId: Uuid;
  }): Promise<TokenPayloadDto> {
    const accessToken = await this.createAccessToken(data);
    const refreshToken = await this.createRefreshToken(data.userId);

    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken,
      refreshToken,
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPayloadDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== TokenType.REFRESH_TOKEN) {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findOne({ id: payload.userId });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.createAuthTokens({ userId: user.id, role: user.role });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const { email, phone, password } = userLoginDto;

    const user = await this.userService.findOne(email ? { email } : { phone });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new UnauthorizedException('Account not approved');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Account does not support password login',
      );
    }

    const isPasswordValid = await validateHash(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateZaloUser(accessToken: string): Promise<UserEntity> {
    try {
      // Gọi API Zalo để lấy thông tin người dùng
      const response = await axios.get('https://graph.zalo.me/v2.0/me', {
        params: { fields: 'id,name,picture' },
        headers: { access_token: `${accessToken}` },
      });

      if (!response.data || !response.data.id) {
        throw new UnauthorizedException('Không lấy được thông tin từ Zalo');
      }

      const { id: zaloId } = response.data;

      // Kiểm tra xem user đã tồn tại trong hệ thống chưa
      let user = await this.userService.findOne({ zaloId });

      if (!user) {
        throw new UnauthorizedException(
          'Người dùng chưa đăng ký trong hệ thống',
        );
      }

      return user;
    } catch (error) {
      console.error('Lỗi khi xác thực Zalo:');
      throw new UnauthorizedException('Xác thực Zalo thất bại');
    }
  }

  // Sau khi làm seeder cho acc Admin rồi thì sử dụng validate được comment bên trên
  //   async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
  //     const user = await this.userService.findOne({
  //       email: userLoginDto.email,
  //     });

  //     const isPasswordValid = await validateHash(
  //       userLoginDto.password,
  //       user?.password,
  //     );

  //     if (!isPasswordValid) {
  //       throw new UserNotFoundException();
  //     }

  //     return user!;
  //   }

  //   async registerZalo(
  //     code: string,
  //     code_verifier: string,
  //   ): Promise<{ message: string }> {
  //     //Step 1: Exchange code to access_token
  //     const tokenResponse = await axios.post(this.ZALO_ACCESS_TOKEN_URL, null, {
  //       params: {
  //         app_id: this.ZALO_APP_ID,
  //         code,
  //         code_verifier,
  //         grant_type: 'authorization_code',
  //       },
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     });

  //     const { access_token, refresh_token } = tokenResponse.data;
  //     if (!access_token) {
  //       throw new BadRequestException("Can't get access_token from zalo");
  //     }

  //     // // Step 2: Get user information from Zalo
  //     const userResponse = await axios.get(this.ZALO_ME_URL, {
  //       headers: { Authorization: `Bearer ${access_token}` },
  //       params: { fields: 'id,name,phone' },
  //     });

  //     const { id: zaloId, name, phone } = userResponse.data;

  //     if (!zaloId || !name) {
  //       throw new BadRequestException("Can't get user information from zalo");
  //     }

  //     let existingUser = await this.userService.findOne({ zaloId });

  //     if (!existingUser) {
  //       existingUser = await this.userService.findOne({ phone });
  //     }

  //     if (existingUser) {
  //       throw new ConflictException(
  //         `User already exists with ${
  //           existingUser.zaloId === zaloId ? 'Zalo ID' : 'Phone'
  //         }!`,
  //       );
  //     }

  //     await this.userService.createUser({
  //       name,
  //       phone: phone,
  //       zaloAccessToken: refresh_token,
  //     });

  //     return { message: 'Register successfully, waiting for approval!' };
  //   }

  async logout(userId: Uuid): Promise<void> {
    await this.userService.saveRefreshToken(userId, null);
  }
}
