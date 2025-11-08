import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class CreateOperatorDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'cashier', 'accountant'])
  role?: 'admin' | 'manager' | 'cashier' | 'accountant';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
