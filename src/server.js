import { env } from './config/env.js';
import connectDB from './config/db.js';
import { app } from './app.js';

async function main() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`API listening on port ${env.port} (${env.nodeEnv})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the other app (e.g. \`lsof -i :${env.port}\` then kill that PID) or change PORT in .env.`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
