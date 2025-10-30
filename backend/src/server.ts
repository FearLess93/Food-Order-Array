import app from './app';
import config from './config/env';
import { checkDatabaseConnection } from './config/database';

async function startServer() {
  try {
    // Check database connection
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      throw new Error('Failed to connect to database');
    }
    console.log('✓ Database connection established');

    // Start server
    app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ API available at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
