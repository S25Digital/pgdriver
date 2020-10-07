const Table = require("./Table");

/**
 * Database Driver
 * Wraps the native pg driver and only exposes the friendly functions
 */
class DbDriver {

  constructor(pool, logger) {
    this._pool = pool;
    this._logger = logger;
  }

  /**
   * wrapper function to execute queries.
   * @param qry 
   * @param values 
   */
  async query(qry, values = []) {
    try {
      const params = {
        "text": qry,
        "values": values
      };
      const {rows} = await this._pool.query(params);

      return rows;
    } catch(err) {
      this._logger.error({
        "message": "There was an error in db operation",
        "error": err
      });
      throw err;
    }
  }

  /**
   * Returns a wrappedClient for running transactions on database.
   * Once a transaction is started, any error will bring the transaction in the hang state
   * Make sure you are handling commit and rollback in proper way
   */
  async startTransaction() {
    const client = await this._pool.connect();

    await client.query("begin");

    const wrappedClient = {
      "query": async (qry, values = []) => {
        const params = {
          "text": qry,
          "values": values
        };
        const {rows} = await client.query(params);
  
        return rows;
      },
      "commit": async () => {
        await client.query("commit");
        client.release();
      },
      "rollback": async () => {
        await client.query("rollback");
        client.release();
      }
    };

    return wrappedClient;
  }

  table(name) {
    return new Table(name);
  }
}

module.exports = DbDriver;
