// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:c7F357e7@localhost:5432/be_checkpoint",
});

export default connectionPool;
