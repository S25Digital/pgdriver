const getLogger = require("pino");
const {Pool} = require("pg");

const DbDriver = require("./Driver");
const {getDbConfigs, validateConfig} = require("./configParser");

const cachedConnectionMap = new Map();

function getConnectedPool(config) {
  const {rwConfig, roConfig} = getDbConfigs(config);

  let rwPool = cachedConnectionMap.get(`${rwConfig.host}-${rwConfig.database}`) || null;
  let roPool = roConfig === null ? rwPool : (cachedConnectionMap.get(`${roConfig.host}-${roConfig.database}`) || null);

  // No cached instance of pool, create a pool and cache it
  if(rwPool === null) {
    rwPool = new Pool(rwConfig);
    cachedConnectionMap.set(`${rwConfig.host}-${rwConfig.database}`, rwPool);
  }

  if(roPool === null) {
    roPool = roConfig === null ? rwPool : new Pool(roConfig);
    if(roConfig !== null) {
      cachedConnectionMap.set(`${roConfig.host}-${roConfig.database}`, roPool);
    }
  }

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
