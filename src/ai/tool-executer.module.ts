import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { EventsModule } from 'src/events/events.module';
import { SpeakerService } from 'src/speaker/speaker.service';
import { SpeakerModule } from 'src/speaker/speaker.module';

@Module({
  imports: [EventsModule, SpeakerModule],
  providers: [ToolExecutorService],
  exports: [ToolExecutorService], // IMPORTANT
})
export class ToolsModule {}