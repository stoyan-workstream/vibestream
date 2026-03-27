import snowflake from "snowflake-sdk";

// Disable OCSP check for dev (Snowflake SDK quirk with Node 18+)
snowflake.configure({ ocspFailOpen: true });

function getConnection(): Promise<snowflake.Connection> {
  const conn = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_PROD_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    database: process.env.SNOWFLAKE_DATABASE || "PROD",
    schema: process.env.SNOWFLAKE_SCHEMA || "PUBLIC",
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || "TRANSFORM_PROD",
    role: process.env.SNOWFLAKE_ROLE || "TRANSFORMER",
  });

  return new Promise((resolve, reject) => {
    conn.connect((err) => {
      if (err) reject(new Error(`Snowflake connection failed: ${err.message}`));
      else resolve(conn);
    });
  });
}

export async function querySnowflake<T = Record<string, unknown>>(
  sql: string,
  binds: snowflake.Binds = [],
): Promise<T[]> {
  const conn = await getConnection();
  try {
    return await new Promise<T[]>((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds,
        complete: (err, _stmt, rows) => {
          if (err) reject(new Error(`Snowflake query failed: ${err.message}`));
          else resolve((rows || []) as T[]);
        },
      });
    });
  } finally {
    conn.destroy(() => {});
  }
}
