import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.categoriesService.create(tenantId, createCategoryDto);
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.categoriesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.categoriesService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.categoriesService.update(tenantId, id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.categoriesService.remove(tenantId, id);
  }
}
