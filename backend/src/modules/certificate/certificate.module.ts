import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [CertificateController],
  providers: [PrismaService, CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
