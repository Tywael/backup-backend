import { IsString } from "class-validator";

export class CreateChatDto {

  @IsString()
  user1Id: string;

    @IsString()
    user2Id: string;
}