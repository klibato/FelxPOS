import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCashRegisterDto {
  @IsOptional()
  @IsString()
  registerCode?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoClosureEnabled?: boolean;

  @IsOptional()
  @IsString()
  autoClosureTime?: string;

  @IsOptional()
  @IsString()
  receiptHeader?: string;

  @IsOptional()
  @IsString()
  receiptFooter?: string;
}
