const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Obrigatório no Azure
        enableArithAbort: true,
        trustServerCertificate: false 
    }
};

// Cria o Pool de conexões. 
// Se a conexão cair, ele reconecta automaticamente na próxima chamada.
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conectado ao Azure SQL Database (Pool)');
    return pool;
  })
  .catch(err => console.log('Falha na conexão Database: ', err));

module.exports = {
  sql,
  poolPromise
};