const { Pool } = require("pg");
const getLogger = require("pino");
const {Pool} = require("pg");

const DbDriver = require("./Driver");

/**
 * Extracts the config required to create a database connection
 * @param {*} config 
 */
function getDbConfig(config) {
  // validate config and throw error
  return {
    "database": config.database,
    "host": config.host,
    "password": config.password,
    "port": config.port,
    "user": config.user
  };
}

/**
 * function to generate an instance of db driver
 * Used by db middleware
 * @param pool 
 * @param logger 
 */
function getDbDriver(config) {
  const {logger} = config;
  const queryLogger = logger || getLogger();
  const dbConfig = getDbConfig(config);
  const pool = new Pool(dbConfig);
  return new DbDriver(pool, queryLogger);
}

module.exports = {
  getDbDriver
};
