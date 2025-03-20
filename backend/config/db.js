// backend/config/db.js
const mysql = require('mysql2/promise');
const logger = require('./logger');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'yoga_group',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: process.env.DB_POOL_LIMIT || 10,
      queueLimit: 0,
      timezone: '+08:00',
      charset: 'utf8mb4',
      ssl: process.env.DB_SSL ? { 
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT 
      } : null
    });

    // 监听连接事件
    this.pool.on('connection', (connection) => {
      logger.info(`[DB] New connection created (ID: ${connection.threadId})`);
    });

    this.pool.on('acquire', (connection) => {
      logger.debug(`[DB] Connection acquired (ID: ${connection.threadId})`);
    });

    this.pool.on('release', (connection) => {
      logger.debug(`[DB] Connection released (ID: ${connection.threadId})`);
    });
  }

  /**
   * 执行SQL查询
   * @param {string} sql - SQL语句
   * @param {Array} params - 查询参数
   * @returns {Promise<Array>} 查询结果
   */
  async query(sql, params = []) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const [rows] = await connection.execute(sql, params);
      return rows;
    } catch (err) {
      logger.error('[DB Query Error]', {
        sql,
        params,
        error: err.message
      });
      throw new Error('Database operation failed');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * 执行事务
   * @param {Function} transactionFn - 事务处理函数
   * @returns {Promise} 事务结果
   */
  async transaction(transactionFn) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await transactionFn(connection);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      logger.error('[DB Transaction Error]', err);
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * 关闭连接池
   */
  async close() {
    await this.pool.end();
    logger.info('[DB] Connection pool closed');
  }
}

// 单例模式实例
module.exports = new Database();