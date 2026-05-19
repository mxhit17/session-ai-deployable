import { InferenceClient } from '@huggingface/inference';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private hf = new InferenceClient(process.env.HF_TOKEN!);

  async chat(message: string, context?: string) {
    try {
      const response = await this.hf.chatCompletion({
        model: 'Qwen/Qwen2.5-7B-Instruct',

        messages: [
          {
            role: 'system',
            content:
              'You are SessionAI assistant. Be concise and helpful.',
          },

          ...(context
            ? [
                {
                  role: 'system' as const,
                  content: context,
                },
              ]
            : []),

          {
            role: 'user',
            content: message,
          },
        ],

        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message;
    } catch (error) {
      console.log(error);
      throw new Error('AI request failed');
    }
  }
  
  async reviewSession(sessionText: string) {
    const prompt = `
    You are a strict conference reviewer.

    Carefully evaluate how well the session matches the event theme and audience.

    If the session does NOT align with the event topic,
    you MUST give a low relevance score.
    If session topic is unrelated to event description,
    relevance must be between 0 and 1.


    Score from 0-10 on:
    - relevance (alignment with event theme)
    - clarity
    - depth
    - novelty

    Return ONLY valid JSON.

    {
       "relevance": number,
       "clarity": number,
       "depth": number,
       "novelty": number,
       "overall_score": number,
       "reasoning": "short explanation"
    }

    Context:
    ${sessionText}

    Respond ONLY with JSON.
    `;


    try {
      const response = await axios.post(
        'http://localhost:11434/api/generate',
        {
          model: 'llama2',
          prompt,
          stream: false,
        },
      );

      return this.extractJSON(response.data.response);
    } catch (error) {
      throw new InternalServerErrorException('AI review failed');
    }
  }

  private extractJSON(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  }


}
