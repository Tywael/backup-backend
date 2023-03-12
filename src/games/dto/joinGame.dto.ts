import { IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";


export class JoinGameDto {
	@IsString()
	@IsNotEmpty({ message: 'Game id is required' })
	gameId: string;
}