const {MongoClient} = require('mongodb');

async function main(){

   const uri = "mongodb://localhost:27017/";
   const client = new MongoClient(uri);

   try {
      await client.connect();
      await limitdocs(client, "mydb", "orders");
   } finally {
      await client.close();
   }
}

main().catch(console.error);


async function limitdocs(client, dbname, colname){
   var myqry = {numPurchased:{$gte:10}};
   const result = await client.db(dbname).collection(colname).find({"numPurchased":{$gte:10}}).toArray();
   console.log(JSON.stringify(result));
}

