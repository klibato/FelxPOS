import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'Café Expresso' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 3.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'standard', enum: ['standard', 'intermediate', 'reduced', 'super_reduced', 'minimum'] })
  @IsNotEmpty()
  @IsString()
  vatRate: 'standard' | 'intermediate' | 'reduced' | 'super_reduced' | 'minimum';
}

export class CreateTransactionDto {
  @ApiProperty({ type: [TransactionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];

  @ApiProperty({ example: 'card', enum: ['cash', 'card', 'check', 'transfer', 'voucher', 'mobile'] })
  @IsNotEmpty()
  @IsEnum(['cash', 'card', 'check', 'transfer', 'voucher', 'mobile'])
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer' | 'voucher' | 'mobile';

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  paymentDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
