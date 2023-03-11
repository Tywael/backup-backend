import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserDto {
    @ApiProperty()
    id: string
    @ApiProperty()
    fortyTwoId: number | null
    @ApiProperty()
    pseudo: string
    @ApiProperty()
    email: string
    @ApiProperty()
    firstName: string | null
    @ApiProperty()
    lastName: string | null
    @ApiProperty()
    avatar: string | null
    @ApiProperty()
    about: string | null
    @ApiProperty()
    experience: bigint
    @ApiProperty()
    status: UserStatus
    @ApiProperty()
    role: UserRole
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date
  }  