import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout status message',
    example: 'Logged out successfully',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
