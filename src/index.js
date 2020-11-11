const getLogger = require("pino");
const {Pool} = require("pg");

const DbDriver = require("./Driver");
const {getDbConfigs, validateConfig} = require("./configParser");

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
  validateConfig(config);
  const {logger} = config;
  const queryLogger = logger || getLogger();
  const {rwPool, roPool} = getConnectedPool(config);
  return new DbDriver({rwPool, roPool, "logger": queryLogger});
}

module.exports = {
  getDbDriver
};
