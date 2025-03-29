import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BranchDto } from './dtos/branch.dto';
import type { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageDto } from '../../common/dto/page.dto';
import { RequestBranchDto } from './dtos/request-branch.dto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';

@ApiTags('branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new branch',
    description: 'Create a new branch or category.',
  })
  @ApiBody({ type: RequestBranchDto, description: 'Data to create a branch' })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully.',
    type: BranchDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body() createBranchDto: RequestBranchDto): Promise<BranchDto> {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all branches',
    description: 'Retrieve a paginated list of all branches.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'List of branches.', type: PageDto })
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<BranchDto>> {
    return this.branchService.getBranches(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a branch by ID',
    description: 'Retrieve details of a branch by its ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Branch ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Branch details.', type: BranchDto })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async findOne(@Param('id') id: Uuid): Promise<BranchDto> {
    return this.branchService.getBranch(id);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({
    summary: 'Update a branch',
    description: 'Update a branch by its ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Branch ID (UUID)' })
  @ApiBody({ type: RequestBranchDto, description: 'Data to update the branch' })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully.',
    type: BranchDto,
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async update(
    @Param('id') id: Uuid,
    @Body() updateBranchDto: RequestBranchDto,
  ): Promise<BranchDto> {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a branch',
    description: 'Delete a branch by its ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Branch ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async remove(@Param('id') id: Uuid): Promise<void> {
    return this.branchService.remove(id);
  }

}
