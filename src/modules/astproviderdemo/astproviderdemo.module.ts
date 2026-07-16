import { Module } from '@nestjs/common';
import { AstproviderdemoService } from './astproviderdemo.service';

@Module({
  providers: [AstproviderdemoService],
})
export class AstproviderdemoModule {}
