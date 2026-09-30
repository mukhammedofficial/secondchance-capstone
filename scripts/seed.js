require('dotenv').config();
const { connectToDatabase, closeDatabase } = require('../src/db');
const items = [
  { title: 'Wooden Chair', description: 'Solid wooden chair in good condition.', category: 'Furniture', location: 'Tashkent', condition: 'Good' },
  { title: 'Desk Lamp', description: 'Working adjustable desk lamp.', category: 'Electronics', location: 'Tashkent', condition: 'Good' },
  { title: 'Coffee Table', description: 'Small coffee table.', category: 'Furniture', location: 'Samarkand', condition: 'Used' },
  { title: 'Bookshelf', description: 'Five-shelf wooden bookcase.', category: 'Furniture', location: 'Tashkent', condition: 'Good' },
  { title: 'Kitchen Plates', description: 'Set of reusable plates.', category: 'Kitchen', location: 'Tashkent', condition: 'Good' },
  { title: 'Electric Kettle', description: 'Working electric kettle.', category: 'Kitchen', location: 'Bukhara', condition: 'Good' },
  { title: 'Backpack', description: 'Everyday backpack.', category: 'Clothing', location: 'Tashkent', condition: 'Used' },
  { title: 'Winter Jacket', description: 'Warm winter jacket.', category: 'Clothing', location: 'Samarkand', condition: 'Good' },
  { title: 'Monitor Stand', description: 'Adjustable monitor stand.', category: 'Electronics', location: 'Tashkent', condition: 'Good' },
  { title: 'Floor Rug', description: 'Medium-size rug.', category: 'Home', location: 'Bukhara', condition: 'Used' },
  { title: 'Plant Pot', description: 'Ceramic plant pot.', category: 'Home', location: 'Tashkent', condition: 'Good' },
  { title: 'Camping Tent', description: 'Two-person camping tent.', category: 'Outdoor', location: 'Samarkand', condition: 'Used' },
  { title: 'Children Books', description: "Collection of children's books.", category: 'Books', location: 'Tashkent', condition: 'Good' },
  { title: 'Office Keyboard', description: 'USB keyboard.', category: 'Electronics', location: 'Tashkent', condition: 'Good' },
  { title: 'Storage Box', description: 'Plastic storage box.', category: 'Home', location: 'Bukhara', condition: 'Good' },
  { title: 'Bicycle Helmet', description: 'Adult bicycle helmet.', category: 'Outdoor', location: 'Tashkent', condition: 'Good' }
].map(item => ({ ...item, price: 0, createdAt: new Date(), updatedAt: new Date() }));

async function seed() {
  if (items.length !== 16) throw new Error(`Expected exactly 16 seed items; got ${items.length}`);
  try {
    const db = await connectToDatabase();
    const collection = db.collection('items');
    await collection.deleteMany({});
    const result = await collection.insertMany(items, { ordered: true });
    const total = await collection.countDocuments({});
    if (result.insertedCount !== 16 || total !== 16) throw new Error(`Expected exactly 16 stored items; inserted=${result.insertedCount}, total=${total}`);
    console.log(`inserted_items: ${result.insertedCount}`);
    return result.insertedCount;
  } finally {
    await closeDatabase();
  }
}

if (require.main === module) seed().catch(error => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
module.exports = { items, seed };
