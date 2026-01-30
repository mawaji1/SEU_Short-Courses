import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AttendanceService } from './attendance.service';
import { ZoomModule } from '../zoom';

/**
 * Session Module
 *
 * Provides training session management:
 * - Session scheduling and management
 * - Zoom meeting integration
 * - Attendance tracking
 */
@Module({
  imports: [ZoomModule],
  controllers: [SessionController],
  providers: [SessionService, AttendanceService],
  exports: [SessionService, AttendanceService],
})
export class SessionModule {}
