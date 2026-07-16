import { Module } from '@nestjs/common';
import { TemplatemethodcheckController } from './templatemethodcheck.controller';
import { TemplatemethodcheckService } from './templatemethodcheck.service';

@Module({
  controllers: [TemplatemethodcheckController],
  providers: [TemplatemethodcheckService],
})
export class TemplatemethodcheckModule {}
