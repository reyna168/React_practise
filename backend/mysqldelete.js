var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "world"
});

var qry ="DELETE FROM city WHERE CountryCode='IND' ORDER BY population LIMIT 5;";
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");

   con.query(qry, function (err, results) {
      if (err) throw err;
      console.log(results);
   });
   con.end();
});