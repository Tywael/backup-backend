import { IsString } from "class-validator";

export class CreateChatDto {

  @IsString()
  userId: string;
}