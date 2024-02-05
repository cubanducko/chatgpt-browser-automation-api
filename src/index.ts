import { server } from './server';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
