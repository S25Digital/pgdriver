const getLogger = require("pino");
const {Pool} = require("pg");

const DbDriver = require("./Driver");

/**
 * Extracts the config required to create a database connection
 * @param {*} config 
 */
function getDbConfigs(config) {
  // validate config and throw error
  const rwConfig = {
    "database": config.database,
    "host": config.host,
    "password": config.password,
    "port": config.port,
    "user": config.user,
    "ssl": config.ssl,
    "statement_timeout": config.statementTimeout || 5000,
    "query_timeout": config.queryTimeout || 10000,
    "connectionTimeoutMillis": config.connectionTimeoutMillis || 5000,
    "idle_in_transaction_session_timeout": config.idleInTransactionSessionTimeout || 12000
  };

  const roConfig = config.roHost? Object.assign({}, rwConfig, {"host": config.roHost}) : null;

  return {rwConfig, roConfig};
}

function getConnectedPool(config) {
  const {rwConfig, roConfig} = getDbConfigs(config);
  const rwPool = new Pool(rwConfig);
  const roPool = rwConfig === null ? rwPool : new Pool(roConfig);

  return {rwPool, roPool};
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
  const {rwPool, roPool} = getConnectedPool(config);
  return new DbDriver({rwPool, roPool, "logger": queryLogger});
}

module.exports = {
  getDbDriver
};
