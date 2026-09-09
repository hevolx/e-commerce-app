const { Client } = require('pg');
const { DB } = require('./config');

(async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id              INT            PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      email           VARCHAR(50)    UNIQUE NOT NULL,
      passwordHash    TEXT           NOT NULL,
      firstName       VARCHAR(50)    NOT NULL,
      lastName        VARCHAR(50)    NOT NULL,
      isActive        BOOLEAN        NOT NULL,
      created         TIMESTAMP NOT NULL DEFAULT NOW(),
      modified        TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `

  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      name            VARCHAR(50)     NOT NULL,
      price           DECIMAL(10, 2)  NOT NULL,
      description     VARCHAR(50)     NOT NULL,
      url             VARCHAR(255),
      created         TIMESTAMP NOT NULL DEFAULT NOW(),
      modified        TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `

  const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      total           INT             NOT NULL,
      status          VARCHAR(50)     NOT NULL,
      created         TIMESTAMP NOT NULL DEFAULT NOW(),
      modified        TIMESTAMP NOT NULL DEFAULT NOW(),
      userId          INT             NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `

  const orderItemsTable = `
    CREATE TABLE IF NOT EXISTS orderItems (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      qty             INT             NOT NULL CHECK (qty > 0),
      price           INT             NOT NULL,
      created         TIMESTAMP NOT NULL DEFAULT NOW(),
      modified        TIMESTAMP NOT NULL DEFAULT NOW(),
      orderId         INT             NOT NULL,
      productId       INT             NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    );
  `

  const cartsTable = `
    CREATE TABLE IF NOT EXISTS carts (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      created         TIMESTAMP NOT NULL DEFAULT NOW(),
      modified        TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `

  const cartItemsTable = `
    CREATE TABLE IF NOT EXISTS cartItems (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      cartId          INT             NOT NULL,
      productId       INT             NOT NULL,
      FOREIGN KEY (cartId) REFERENCES carts(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    );
  `

  const sessionTable = `
    CREATE TABLE IF NOT EXISTS session (
      sid             VARCHAR       NOT NULL COLLATE "default",
      sess            JSON          NOT NULL,
      expire          TIMESTAMP(6)  NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    );
  `

  const sessionExpireIndex = `
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire);
  `

  const db = new Client({
    user: DB.PGUSER,
    host: DB.PGHOST,
    database: DB.PGDATABASE,
    password: DB.PGPASSWORD,
    port: DB.PGPORT
  });

  try {
    await db.connect();

    // Create tables on database
    await db.query(usersTable);
    await db.query(productsTable);
    await db.query(ordersTable);
    await db.query(orderItemsTable);
    await db.query(cartsTable);
    await db.query(cartItemsTable);
    await db.query(sessionTable);
    await db.query(sessionExpireIndex);
  } catch (err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();