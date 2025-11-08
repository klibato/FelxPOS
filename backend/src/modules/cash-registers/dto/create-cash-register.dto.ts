import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCashRegisterDto {
  @IsString()
  registerCode: string;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  name?: string;

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
