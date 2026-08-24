import { createApp } from './app';
import { config } from './config';
import prisma from './config/prisma';

const app = createApp();

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected via Prisma ORM.');

    app.listen(config.port, () => {
      console.log(`🚀 QuickStore API server listening on http://localhost:${config.port}`);
      console.log(`📚 Swagger API documentation: http://localhost:${config.port}/api/docs`);
      console.log(`⚡ Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();