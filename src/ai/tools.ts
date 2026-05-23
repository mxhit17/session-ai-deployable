export const tools = [
  {
    type: 'function',

    function: {
      name: 'getOpenCfpEvents',

      description:
        'Get all public events where CFP (Call for Papers) is currently open.',

      parameters: {
        type: 'object',

        properties: {},

        required: [],
      },
    },
  },

  {
    type: 'function',

    function: {
      name: 'getMyOrganizedEvents',

      description:
        'Get all events organized by the currently logged in user.',

      parameters: {
        type: 'object',

        properties: {},

        required: [],
      },
    },
  },

  {
    type: 'function',

    function: {
        name: 'getClosingSoonCfpEvents',

        description:
        'Get public events whose CFP deadline is approaching and will close within the specified number of days.',

        parameters: {
        type: 'object',

        properties: {
            days: {
            type: 'number',

            description:
                'Number of days to check for CFP closing soon. Default is 7.',
            },
        },

        required: [],
        },
    },
  },

  {
    type: 'function',

    function: {
      name: 'searchEvents',

      description:
        'Search public events by topic, keyword, category, or location.',

      parameters: {
        type: 'object',

        properties: {
          topic: {
            type: 'string',

            description:
              'Topic, technology, keyword, or category related to the event.',
          },

          location: {
            type: 'string',

            description:
              'City, country, or place where the event happens.',
          },
        },

        required: [],
      },
    },
  },

  {
    type: 'function',

    function: {
      name: 'recommendEventsForSpeaker',

      description:
        'Recommend relevant conferences and CFP events for the current speaker based on their speaker profile bio and interests.',

      parameters: {
        type: 'object',

        properties: {},

        required: [],
      },
    },
  },

  {
    type: 'function',

    function: {
      name: 'summarizeEvent',

      description:
        'Get detailed information about a specific public event so the AI can summarize it for the user.',

      parameters: {
        type: 'object',

        properties: {
          eventId: {
            type: 'string',

            description:
              'The ID of the event to summarize.',
          },
        },

        required: ['eventId'],
      },
    },
  },
];