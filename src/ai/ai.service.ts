import { InferenceClient } from '@huggingface/inference';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { tools } from './tools';

@Injectable()
export class AiService {
  private hf = new InferenceClient(process.env.HF_TOKEN!);

  async chat(
    message: string,
    messages: any[] = [],
  ) {
    try {
      const response = await this.hf.chatCompletion({
        model: 'Qwen/Qwen2.5-7B-Instruct',

        messages: [
          {
            role: 'system',

            content: `
You are SessionAI assistant.

You MUST use tools for ALL event-related requests.

1. If the user wants:
- event recommendations
- CFP recommendations
- conferences to apply to
- events suitable for the speaker
- speaking opportunities

USE:
recommendEventsForSpeaker

Use tools whenever the user asks about:
- events
- CFPs
- organizers
- event search
- locations
- topics
- conferences
- event details
- event summaries

Examples:
- "Find AI events in Delhi"
- "Search Flutter conferences"
- "Find React events in Bangalore"
- "Summarize this event"
- "Give me quick details"
- "Tell me about this conference"

If the user asks for event details or a summary,
use the summarizeEvent tool.

Never invent event information.
Always use tools for event-related queries.
`,
          },

          ...messages,

          {
            role: 'user',
            content: message,
          },
        ],

        tools,

        tool_choice: 'auto',

        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message;
    } catch (error) {
      console.log(error);

      throw new Error('AI request failed');
    }
  }

  async chatWithToolResult({
    originalMessage,
    previousMessages,
    toolCall,
    toolResult,
  }: {
    originalMessage: string;
    previousMessages: any[];
    toolCall: any;
    toolResult: any;
  }) {
    const response =
      await this.hf.chatCompletion({
        model: 'Qwen/Qwen2.5-7B-Instruct',

        messages: [
          {
            role: 'system',

            content: `
  You are SessionAI assistant.

  Answer naturally using tool data.
  `,
          },

          ...previousMessages,

          {
            role: 'user',
            content: originalMessage,
          },

          toolCall,

          {
            role: 'tool',

            tool_call_id:
              toolCall.tool_calls[0].id,

            content: JSON.stringify(
              toolResult,
            ),
          },
        ],

        max_tokens: 300,
        temperature: 0.7,
      });

    return response.choices[0].message;
  }

  // async reviewSession(sessionText: string) {
  //   const prompt = `
  //   You are a strict conference reviewer.

  //   Carefully evaluate how well the session matches the event theme and audience.

  //   If the session does NOT align with the event topic,
  //   you MUST give a low relevance score.
  //   If session topic is unrelated to event description,
  //   relevance must be between 0 and 1.


  //   Score from 0-10 on:
  //   - relevance (alignment with event theme)
  //   - clarity
  //   - depth
  //   - novelty

  //   Return ONLY valid JSON.

  //   {
  //      "relevance": number,
  //      "clarity": number,
  //      "depth": number,
  //      "novelty": number,
  //      "overall_score": number,
  //      "reasoning": "short explanation"
  //   }

  //   Context:
  //   ${sessionText}

  //   Respond ONLY with JSON.
  //   `;


  //   try {
  //     const response = await axios.post(
  //       'http://localhost:11434/api/generate',
  //       {
  //         model: 'llama2',
  //         prompt,
  //         stream: false,
  //       },
  //     );

  //     return this.extractJSON(response.data.response);
  //   } catch (error) {
  //     throw new InternalServerErrorException('AI review failed');
  //   }
  // }

  async reviewSession({
    eventTitle,
    eventDescription,
    sessionTitle,
    sessionDescription,
  }: {
    eventTitle: string;
    eventDescription: string;
    sessionTitle: string;
    sessionDescription: string;
  }) {
    const response = await this.hf.chatCompletion({
      model: 'Qwen/Qwen2.5-7B-Instruct',

      temperature: 0.2,

      max_tokens: 400,

      response_format: {
        type: 'json_object',
      },

      messages: [
        {
          role: 'system',
          content: `
  You are an expert conference CFP reviewer.

  Your job is to evaluate whether a proposed talk
  is suitable for a conference/event.

  SCORING RULES:

  - relevance:
  How strongly the session aligns with the event theme.

  0-1 = completely unrelated
  2-4 = weak fit
  5-7 = reasonable fit
  8-10 = excellent fit

  - clarity:
  How understandable and well-structured the proposal is.

  - depth:
  Technical depth and actionable insight.

  - novelty:
  Originality and uniqueness.

  IMPORTANT:
  If the session topic does not match the event topic,
  relevance MUST be very low.

  Return ONLY valid JSON.
  `,
        },

        {
          role: 'user',
          content: `
  EVENT:

  Title:
  ${eventTitle}

  Description:
  ${eventDescription}

  SESSION:

  Title:
  ${sessionTitle}

  Description:
  ${sessionDescription}

  Return:

  {
    "relevance": number,
    "clarity": number,
    "depth": number,
    "novelty": number,
    "overall_score": number,
    "acceptance_probability": number,
    "strengths": [string],
    "weaknesses": [string],
    "reasoning": string
  }
  `,
        },
      ],
    });

    return JSON.parse(
      response.choices[0].message.content || '{}',
    );
  }

  private extractJSON(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  }
}
