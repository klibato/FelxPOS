import { IsString } from 'class-validator';

export class CreateClosureDto {
  @IsString()
  date: string;

  @IsString()
  registerId: string;
}
