import { Injectable } from '@nestjs/common';

import { EventsService } from '../events/events.service';
import { SpeakerService } from 'src/speaker/speaker.service';

@Injectable()
export class ToolExecutorService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly speakerService: SpeakerService,

  ) {}

  async executeTool(
  toolName: string,
  userId: string,
  args: any = {},
){
    switch (toolName) {
      case 'getOpenCfpEvents': {
        const events =
          await this.eventsService.listPublicEvents();

        // return events.filter(
        //   (event) => event.cfp_open === true,
        // );
        const now = new Date();

        return events.filter((event) => {
            if (!event.cfp_start || !event.cfp_end) {
                return false;
            }
            const cfpStart = new Date(event.cfp_start);
            const cfpEnd = new Date(event.cfp_end);

            return (
                event.cfp_open === true &&
                now >= cfpStart &&
                now <= cfpEnd
            );
        });
      }

      case 'getMyOrganizedEvents': {
        return this.eventsService.getEventsByOrganizer(
          userId,
        );
      }

      case 'getClosingSoonCfpEvents': {
        return this.eventsService.getEventsWithClosingSoonCfp(
          args.days || 7,
        );
      }

      case 'searchEvents': {
        return this.eventsService.searchEvents({
          topic: args.topic,
          location: args.location,
        });
      }

      case 'recommendEventsForSpeaker': {
        return this.getRecommendedEvents(userId);
      }

      case 'summarizeEvent': {
        return this.eventsService.getEventById(
          args.eventId,
        );
      }

      default:
        throw new Error(
          `Unknown tool: ${toolName}`,
        );
    }
  }

  private async getRecommendedEvents(
    userId: string,
  ) {
    // STEP 1: GET SPEAKER PROFILE
    const profile =
      await this.speakerService.getOrCreateProfile(
        userId,
      );

    // STEP 2: GET OPEN CFP EVENTS
    const events =
      await this.eventsService.listPublicEvents();

    const now = new Date();

    const openCfpEvents = events.filter((event) => {
      if (!event.cfp_start || !event.cfp_end) {
        return false;
      }

      const start = new Date(event.cfp_start);
      const end = new Date(event.cfp_end);

      return (
        event.cfp_open === true &&
        now >= start &&
        now <= end
      );
    });

    // STEP 3: EXTRACT KEYWORDS FROM BIO
    const bio =
      profile.bio?.toLowerCase() || '';

    const keywords = bio
      .split(/[\s,.-]+/)
      .filter((word) => word.length > 3);

    // STEP 4: SCORE EVENTS
    const scoredEvents = openCfpEvents.map(
      (event) => {
        const searchableText = `
          ${event.title}
          ${event.description}
        `.toLowerCase();

        let score = 0;

        for (const keyword of keywords) {
          if (
            searchableText.includes(keyword)
          ) {
            score += 1;
          }
        }

        return {
          ...event,
          matchScore: score,
        };
      },
    );

    // STEP 5: SORT BEST MATCHES
    const recommended = scoredEvents
      .filter((event) => event.matchScore > 0)
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore,
      );

    // OPTIONAL FALLBACK
    if (recommended.length === 0) {
      return openCfpEvents.slice(0, 5);
    }

    return recommended.slice(0, 10);
  }
}