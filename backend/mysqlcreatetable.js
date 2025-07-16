var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

var qry = `CREATE TABLE IF NOT EXISTS employee (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(20) NOT NULL,
   age INT,
   salary FLOAT
);`;

con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");

   con.query(qry, function (err, result) {
      if (err) throw err;
      console.log("Created table successfully");

      // 等第一個 query 完成後再執行第二個
      con.query("SHOW TABLES;", function (err, result) {
         if (err) throw err;
         console.log("Showing tables\n");
         for (var i = 0; i < result.length; i++) {
            console.log(JSON.stringify(result[i]));
         }

         // 所有查詢完成後再結束連線
         con.end();
      });
   });
});
