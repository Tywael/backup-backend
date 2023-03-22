import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {

  @IsString()
  @ApiProperty()
  user1Id: string;

  @IsString()
  @ApiProperty()
  user2Id: string;
}

export class ChatDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
}