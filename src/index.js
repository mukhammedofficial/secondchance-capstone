require('dotenv').config();
const { createApp } = require('./app');
const { connectToDatabase } = require('./db');
const port = Number(process.env.PORT || 3000);
async function start() {
  await connectToDatabase();
  const server = createApp().listen(port, () => console.log(`SecondChance listening on port ${port}`));
  return server;
}
if (require.main === module) start().catch(error => { console.error('Startup failed:', error.message); process.exit(1); });
module.exports = { start };
