import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  UploadedFile,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { ApiPageResponse } from '../../decorators/api-page-response.decorator';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth, UUIDParam } from '../../decorators/http.decorators';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersPageOptionsDto } from './dtos/users-page-options.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { ApiFile } from 'decorators/swagger.schema';
import { Reference } from 'types';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Get users list',
    type: PageDto,
  })
  getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    console.log('pageOptionsDto', pageOptionsDto);
    return this.userService.getUsers(pageOptionsDto);
  }

  //   @Get('pending')
  //   @Auth([RoleType.ADMIN])
  //   @HttpCode(HttpStatus.OK)
  //   @ApiPageResponse({
  //     description: 'Get list of pending users',
  //     type: PageDto,
  //   })
  //   async getPendingUsers(
  //     @Query(new ValidationPipe({ transform: true }))
  //     pageOptionsDto: UsersPageOptionsDto,
  //   ): Promise<PageDto<UserDto>> {
  //     return this.userService.getPendingUsers(pageOptionsDto);
  //   }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiParam({ name: 'id', type: String, description: 'User ID (UUID)' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get users list',
    type: UserDto,
  })
  getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
    return this.userService.getUser(userId);
  }

  @Patch(':id/approve')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User approved successfully',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to approve',
    required: true,
    type: String,
    format: 'uuid',
  })
  async approveUser(@UUIDParam('id') userId: Uuid): Promise<void> {
    await this.userService.approveUser(userId);
  }

  @Patch(':id/refuse')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User refused successfully',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to refuse',
    required: true,
    type: String,
    format: 'uuid',
  })
  async refuseUser(@UUIDParam('id') userId: Uuid): Promise<void> {
    await this.userService.refuseUser(userId);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  async deleteUser(@UUIDParam('id') userId: Uuid): Promise<void> {
    await this.userService.deleteUser(userId);
  }

  @Patch(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to update',
    required: true,
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateUserDto, description: 'Data to update user' })
  @ApiFile({ name: 'avatar' }) // Hiển thị trong Swagger
  async updateUser(
    @UUIDParam('id') userId: Uuid,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() currentUser: UserEntity,
    @UploadedFile() file?: Reference<Express.Multer.File>, // Thêm file upload
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, updateUserDto, currentUser, file);
  }

  //   @Get('branch/:branchId')
  //   @ApiOperation({
  //     summary: 'Get users by branch ID',
  //     description:
  //       'Retrieve a paginated list of users belonging to a specific branch.',
  //   })
  //   @ApiParam({ name: 'branchId', type: String, description: 'Branch ID (UUID)' })
  //   @ApiQuery({
  //     name: 'page',
  //     type: Number,
  //     required: false,
  //     description: 'Page number (default: 1)',
  //   })
  //   @ApiQuery({
  //     name: 'limit',
  //     type: Number,
  //     required: false,
  //     description: 'Items per page (default: 10)',
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'List of users in the branch.',
  //     type: PageDto,
  //   })
  //   async getUsersByBranch(
  //     @Param('branchId') branchId: string,
  //     @Query(new ValidationPipe({ transform: true }))
  //     pageOptionsDto: UsersPageOptionsDto,
  //   ): Promise<PageDto<UserDto>> {
  //     return this.userService.getUsersByBranch(branchId, pageOptionsDto);
  //   }

  
}
