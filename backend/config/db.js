// config/db.js
module.exports = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'yoga_group',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./config/mysql-ca.crt')
  }
}
