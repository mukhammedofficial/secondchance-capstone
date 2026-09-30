require('dotenv').config();
const natural = require('natural');
const app = require('./app');
const { connectToDatabase } = require('./db');

const PORT = Number(process.env.PORT || 3000);
async function startServer() {
  await connectToDatabase();
  const server = app.listen(PORT, () => {
    console.log(`SecondChance server running on port ${PORT}`);
    console.log(`Natural version loaded: ${natural.version || 'available'}`);
  });
  return server;
}

if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start SecondChance:', error.message);
    process.exit(1);
  });
}
module.exports = { startServer };
