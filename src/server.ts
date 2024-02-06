import Fastify, { RouteShorthandOptions } from 'fastify';
import {
  ChatGPTModels,
  FreeChatGPTAssistant,
  recordAuth,
} from './chatgpt-automation';

export const server = Fastify({
  logger: true,
});

server.get('/login', async function handler(request, reply) {
  recordAuth();
});

interface SendMessagePayload {
  message: string;
  model: ChatGPTModels;
}

const sendMessageSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        model: { type: 'string' },
      },
      required: ['message'],
    },
  },
};

server.get<{ Querystring: SendMessagePayload }>(
  '/send-message',
  sendMessageSchema,
  async function handler(request, reply) {
    const { message, model } = request.query;

    const api = new FreeChatGPTAssistant(model);
    const response = await api.sendMessage(message);

    return response;
  },
);
