const Joi = require("joi");

const configSchema = Joi.object().keys({
  "host": Joi.string().required(),
  "roHost": Joi.string(),
  "database": Joi.string().required(),
  "port": Joi.number().integer().greater(0).required(),
  "password": Joi.string().required(),
  "user": Joi.string().required(),
  "statementTimeout": Joi.number().integer(),
  "queryTimeout": Joi.number().integer(),
  "connectionTimeoutMillis": Joi.number().integer(),
  "idleInTransactionSessionTimeout": Joi.number().integer(),
  "idleTimeoutMillis": Joi.number().integer()
});

/**
 * Extracts the config required to create a database connection
 * @param {*} config 
 */
function getDbConfigs(config) {
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
    "idle_in_transaction_session_timeout": config.idleInTransactionSessionTimeout || 10000,
    "idleTimeoutMillis": config.idleTimeoutMillis || 10000
  };

  const roConfig = config.roHost? Object.assign({}, rwConfig, {"host": config.roHost}) : null;

  return {rwConfig, roConfig};
}

function validateConfig(config) {
  const res = configSchema.validate(config);
  if(res.error) {
    throw res.error;
  }
}

module.exports = {
  getDbConfigs,
  validateConfig
};