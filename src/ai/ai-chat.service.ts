import { Injectable } from '@nestjs/common';

import { AiService } from './ai.service';
import { ToolExecutorService } from './tool-executor.service';

@Injectable()
export class AiChatService {
  constructor(
    private readonly aiService: AiService,
    private readonly toolExecutor: ToolExecutorService,
  ) {}

  async chat(
    userMessage: string,
    userId: string,
    history: any[] = [],
  ) {
    console.log('\n========== AI CHAT START ==========');
    console.log('User Message:', userMessage);

    // FIRST AI CALL
    console.log('\n[STEP 1] Calling aiService.chat()');

    const aiMessage =
      await this.aiService.chat(
        userMessage,
        history,
      );

    console.log('[STEP 1 DONE] AI Response Received');
    console.log(
      'AI Message:',
      JSON.stringify(aiMessage, null, 2),
    );

    // TOOL CALL DETECTION
    if (aiMessage.tool_calls?.length) {
      console.log(
        '\n[STEP 2] Tool Call Detected',
      );

      const toolCall =
        aiMessage.tool_calls[0];

      const toolName =
        toolCall.function.name;

      console.log(
        'Function Being Called:',
        toolName,
      );

      // EXECUTE TOOL
      const args = toolCall.function.arguments
        ? JSON.parse(
            toolCall.function.arguments,
          )
        : {};

      console.log(
        'Tool Arguments:',
        JSON.stringify(args, null, 2),
      );

      console.log(
        '\n[STEP 3] Executing Tool:',
        toolName,
      );

      const toolResult =
        await this.toolExecutor.executeTool(
          toolName,
          userId,
          args,
        );

      console.log(
        '[STEP 3 DONE] Tool Result:',
      );
      console.log(
        JSON.stringify(toolResult, null, 2),
      );

      // SECOND AI CALL
      console.log(
        '\n[STEP 4] Calling aiService.chatWithToolResult()',
      );

      const finalResponse =
        await this.aiService.chatWithToolResult({
          originalMessage: userMessage,
          previousMessages: history,
          toolCall: aiMessage,
          toolResult,
        });

        let structuredData = {};

        if (toolName === 'recommendEventsForSpeaker') {
          const eventsArray = Array.isArray(toolResult)
            ? toolResult
            : [toolResult];

          structuredData = {
            events: eventsArray.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              location: event.location,
              startDate: event.start_date,
              endDate: event.end_date,
              cfpStart: event.cfp_start,
              cfpEnd: event.cfp_end,
              matchScore:
                (event as any).matchScore || 0,
            })),
          };
        }



      console.log(
        '[STEP 4 DONE] Final AI Response:',
      );
      console.log(
        JSON.stringify(finalResponse, null, 2),
      );

      console.log(
        '\n========== AI CHAT END ==========\n',
      );

      // return finalResponse;
      return {
        ...finalResponse,
        ...structuredData,
      };
    }

    console.log(
      '\n[NO TOOL CALL] Returning Normal AI Response',
    );

    console.log(
      '\n========== AI CHAT END ==========\n',
    );

    // NORMAL RESPONSE
    return aiMessage;
  }
}