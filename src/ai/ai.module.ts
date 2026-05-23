import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiChatService } from './ai-chat.service';
import { ToolsModule } from './tool-executer.module';

@Module({
  imports: [ToolsModule],
  controllers: [AiController],
  providers: [AiService, AiChatService],
  exports: [AiService, AiChatService], // IMPORTANT
})
export class AiModule {}
