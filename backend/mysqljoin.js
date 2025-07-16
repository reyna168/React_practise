var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "mypassword",
   database: "mydb"
});

var qry =`
SELECT 
   m.member_id, 
   m.name AS member, 
   c.committee_id, 
   c.name AS committee
FROM
   members m
INNER JOIN committees c ON c.name = m.name;
`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
   con.query(qry, function (err, results) {
      if (err) throw err;
      results.forEach((row) => {
         console.log(JSON.stringify(row));
      });
   });

   con.end();
});
