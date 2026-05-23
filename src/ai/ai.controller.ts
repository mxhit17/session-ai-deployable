import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AiChatService } from './ai-chat.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiChatService: AiChatService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('chat')
  async chat(
    @Body() body: { message: string },
    @Req() req,
  ) {
    // console.log('REQ USER =>', req.user);

    return this.aiChatService.chat(
      body.message,
      req.user.sub,
    );
  }
}