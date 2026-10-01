import { Pool, QueryResult, QueryResultRow } from 'pg';
import config from './env';

const database = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export default {
  // Função helper nativa para queries simples
  query: <R extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<R>> => {
    return database.query<R>(text, params);
  },

  // Wrapper customizado que oculta o pool.connect()
  getClient: async () => {
    const client = await database.connect();
    return client;
  },
};
