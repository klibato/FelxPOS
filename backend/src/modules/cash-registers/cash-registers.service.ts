import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';

@Injectable()
export class CashRegistersService {
  constructor(
    @InjectRepository(CashRegister)
    private cashRegistersRepository: Repository<CashRegister>,
  ) {}

  async create(tenantId: string, createCashRegisterDto: CreateCashRegisterDto): Promise<CashRegister> {
    // Generate registerCode and serialNumber if not provided
    const registerCode = createCashRegisterDto.registerCode || `REG-${Date.now()}`;
    const serialNumber = createCashRegisterDto.serialNumber || `SN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const cashRegister = this.cashRegistersRepository.create({
      ...createCashRegisterDto,
      registerCode,
      serialNumber,
      tenantId,
    });
    return this.cashRegistersRepository.save(cashRegister);
  }

  async findAll(tenantId: string): Promise<CashRegister[]> {
    return this.cashRegistersRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<CashRegister> {
    const cashRegister = await this.cashRegistersRepository.findOne({
      where: { id, tenantId },
    });

    if (!cashRegister) {
      throw new NotFoundException(`Cash register with ID ${id} not found`);
    }

    return cashRegister;
  }

  async update(tenantId: string, id: string, updateCashRegisterDto: UpdateCashRegisterDto): Promise<CashRegister> {
    const cashRegister = await this.findOne(tenantId, id);
    Object.assign(cashRegister, updateCashRegisterDto);
    return this.cashRegistersRepository.save(cashRegister);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const cashRegister = await this.findOne(tenantId, id);
    await this.cashRegistersRepository.remove(cashRegister);
  }
}
