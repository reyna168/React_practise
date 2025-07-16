const {MongoClient} = require('mongodb');

async function main(){

   const uri = "mongodb://localhost:27017/";
   const client = new MongoClient(uri);

   try {
      await client.connect();
      await dropcol(client, "mydb", "products");
   } finally {
      await client.close();
   }
}
main().catch(console.error);


async function dropcol(client, dbname, colname){
   const result = await client.db(dbname).collection(colname).drop();
   console.log("Collection dropped ");

}