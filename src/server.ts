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
    'Can you generate an image with cubist, black and white, abstract about the lack of phones on a big supermarket?. Include multiple sad people and use big shapes. Use a 2:3 aspect ratio',
  );

  return response;
});
