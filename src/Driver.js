const Table = require("./Table");

/**
 * Database Driver
 * Wraps the native pg driver and only exposes the friendly functions
 */
class DbDriver {

  constructor({rwPool, roPool, logger}) {
    this._rwPool = rwPool;
    this._logger = logger;
    this._roPool = roPool;
  }

  /**
   * wrapper function to execute queries.
   * If the qry starts with the select keyword, the query will be routed to read only pool
   * @param qry
   * @param values
   */
  async query(qry, values = []) {
    try {
      const params = {
        "text": qry,
        "values": values
      };
      const isReadOnly = qry.toLowerCase().startsWith("select");
      const {rows} = isReadOnly === true ? await this._roPool.query(params) : await this._rwPool.query(params);

      return rows;
    } catch(err) {
      this._logger.error({
        "message": "There was an error in db operation",
        "error": err
      });
      return err;
    }
  }

  /**
   * Returns a wrappedClient for running transactions on database.
   * Once a transaction is started, any error will bring the transaction in the hang state
   * Make sure you are handling commit and rollback in proper way
   * Transaction will always run on primary i.e. read/write Pool
   */
  async startTransaction() {
    const client = await this._rwPool.connect();

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
