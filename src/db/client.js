import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

function getConnectionConfig() {
  const url = process.env.DATABASE_URL;

  
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    connectionString: url,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
}

export const pool = new Pool(getConnectionConfig());

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}