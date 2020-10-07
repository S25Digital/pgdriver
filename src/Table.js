class Table {
  constructor(name, client) {
    this._name = name;
    this._client = client;
  };

  select(fields) {
    this._selection = fields;
    return this;
  }

  where(obj) {
    return this;
  }

  async find() {
    const qry = this._generateQry();
    const rows = await this._client.query(qry);
    return rows;
  }

  async findOne() {
    const rows = this.find();
    return rows.length > 0 ? rows[0] : null;
  }

}

module.exports = Table;
