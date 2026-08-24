require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`Community Connect API listening on port ${port}`);
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    server.close(() => process.exit(1));
  });
}

startServer().catch((error) => {
  console.error('Unable to start Community Connect API:', error.message);
  process.exit(1);
});