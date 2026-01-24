import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateModuleDto,
  UpdateModuleDto,
  CreateSessionDto,
  UpdateSessionDto,
} from './dto/module.dto';

@Controller('curriculum')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  // =========================================================================
  // MODULES
  // =========================================================================

  @Post('modules')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createModule(@Body() dto: CreateModuleDto) {
    return this.curriculumService.createModule(dto);
  }

  @Get('programs/:programId/modules')
  async getModulesByProgram(@Param('programId') programId: string) {
    return this.curriculumService.getModulesByProgram(programId);
  }

  @Get('modules/:id')
  async getModule(@Param('id') id: string) {
    return this.curriculumService.getModule(id);
  }

  @Put('modules/:id')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  async updateModule(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.curriculumService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  @HttpCode(HttpStatus.OK)
  async deleteModule(@Param('id') id: string) {
    return this.curriculumService.deleteModule(id);
  }

  @Put('programs/:programId/modules/reorder')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  async reorderModules(
    @Param('programId') programId: string,
    @Body() body: { moduleIds: string[] },
  ) {
    return this.curriculumService.reorderModules(programId, body.moduleIds);
  }

  // =========================================================================
  // SESSIONS
  // =========================================================================

  @Post('sessions')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() dto: CreateSessionDto) {
    return this.curriculumService.createSession(dto);
  }

  @Get('modules/:moduleId/sessions')
  async getSessionsByModule(@Param('moduleId') moduleId: string) {
    return this.curriculumService.getSessionsByModule(moduleId);
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    return this.curriculumService.getSession(id);
  }

  @Put('sessions/:id')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  async updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.curriculumService.updateSession(id, dto);
  }

  @Delete('sessions/:id')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  @HttpCode(HttpStatus.OK)
  async deleteSession(@Param('id') id: string) {
    return this.curriculumService.deleteSession(id);
  }

  @Put('modules/:moduleId/sessions/reorder')
  @Roles(UserRole.ADMIN, UserRole.PROGRAM_MANAGER)
  async reorderSessions(
    @Param('moduleId') moduleId: string,
    @Body() body: { sessionIds: string[] },
  ) {
    return this.curriculumService.reorderSessions(moduleId, body.sessionIds);
  }
}
