const {MongoClient} = require('mongodb');

async function main(){

   const uri = "mongodb://localhost:27017/";
   const client = new MongoClient(uri);

   try {
      await client.connect();
      await sortdocs(client, "mydb", "products");
   } finally {
      await client.close();
   }
}

main().catch(console.error);
async function sortdocs(client, dbname, colname){
   var mysort = { price: 1 };
   const result = await client.db(dbname).collection(colname).find({}).sort(mysort).toArray();
   result.forEach(element => {
      console.log(element);
   });
}
