const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:     process.env.DB_HOST,       // RDS endpoint
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,                 // max 10 simultaneous DB connections
  ssl: { rejectUnauthorized: false },  // required for Amazon RDS
});

module.exports = { pool };
