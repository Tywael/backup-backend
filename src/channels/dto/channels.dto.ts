import { IsString } from "class-validator";

export class CreateChannelDto {
    @IsString()
    userId: string;
}

export class JoinChannelDto {
    @IsString()
    chatId: string;

    @IsString()
    userId: string;
}

export class UpdateChannelDto {
    @IsString()
    chatId: string;

    // add more fields here (data: { ... })
}

export class DeleteChannelDto {
    @IsString()
    chatId: string;

    @IsString()
    userId: string;
}