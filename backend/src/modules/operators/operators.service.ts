import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operator } from './entities/operator.entity';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorsService {
  constructor(
    @InjectRepository(Operator)
    private operatorsRepository: Repository<Operator>,
  ) {}

  async create(tenantId: string, createOperatorDto: CreateOperatorDto): Promise<Operator> {
    const operator = this.operatorsRepository.create({
      ...createOperatorDto,
      tenantId,
    });
    return this.operatorsRepository.save(operator);
  }

  async findAll(tenantId: string): Promise<Operator[]> {
    return this.operatorsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Operator> {
    const operator = await this.operatorsRepository.findOne({
      where: { id, tenantId },
    });

    if (!operator) {
      throw new NotFoundException(`Operator with ID ${id} not found`);
    }

    return operator;
  }

  async update(tenantId: string, id: string, updateOperatorDto: UpdateOperatorDto): Promise<Operator> {
    const operator = await this.findOne(tenantId, id);
    Object.assign(operator, updateOperatorDto);
    return this.operatorsRepository.save(operator);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const operator = await this.findOne(tenantId, id);

    try {
      await this.operatorsRepository.remove(operator);
    } catch (error) {
      // Catch foreign key constraint violations (NF525 compliance)
      if (error.code === '23503') {
        throw new BadRequestException(
          'Impossible de supprimer cet opérateur : il est référencé dans des transactions, clôtures ou logs d\'audit (conformité NF525)',
        );
      }
      throw error;
    }
  }
}
