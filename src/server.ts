import Fastify from 'fastify';
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

server.get('/send-message', async function handler(request, reply) {
  const api = new FreeChatGPTAssistant(ChatGPTModels.GPT4);
  const response = await api.sendMessage(
    'Can you give me a story about Ricardo? A kid that does not sleep',
  );

  return response;
});
