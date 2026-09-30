require('dotenv').config();
const { connectToDatabase, disconnectFromDatabase } = require('../src/db');
const { Item } = require('../src/models');
const items = [
 ['Desk lamp','Adjustable LED desk lamp with warm and cool settings','Home','good',8],
 ['Winter coat','Warm navy winter coat, size M','Clothing','good',18],
 ['JavaScript handbook','Used programming reference book with clean pages','Books','like-new',10],
 ['Acoustic guitar','Full-size acoustic guitar, recently restrung','Music','fair',45],
 ['Ceramic dinner set','Six plates and six bowls, no chips','Home','good',22],
 ['Mountain bike','Adult mountain bike with working brakes','Sports','good',85],
 ['Plant pots','Set of four terracotta pots','Garden','like-new',7],
 ['Kids building blocks','Large mixed set of wooden blocks','Toys','good',12],
 ['Coffee table','Solid wood coffee table with minor marks','Furniture','fair',30],
 ['Digital camera','Compact point-and-shoot camera with charger','Electronics','good',55],
 ['Yoga mat','Non-slip exercise mat, lightly used','Sports','like-new',9],
 ['Cookware set','Three stainless steel pans','Kitchen','good',20],
 ['Board game','Complete family strategy board game','Toys','like-new',14],
 ['Backpack','Water-resistant 25 litre day backpack','Clothing','good',16],
 ['Floor fan','Quiet three-speed floor fan','Home','good',17],
 ['Watercolour set','Paints, brushes, and paper for beginners','Arts','new',11]
].map(([title, description, category, condition, price]) => ({ title, description, category, condition, price, location: 'Local pickup' }));
async function seed() {
  try {
    await connectToDatabase();
    const result = await Item.insertMany(items, { ordered: true });
    console.log(JSON.stringify({ inserted_items: result.length }));
  } finally { await disconnectFromDatabase(); }
}
if (require.main === module) seed().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { items, seed };
