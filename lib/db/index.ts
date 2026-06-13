import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// Parse the connection string to check if password placeholder is replaced
const isValidConnectionString = 
  connectionString && 
  connectionString.startsWith('postgresql://') && 
  !connectionString.includes('[YOUR-PASSWORD]');

// Initialize postgres-js client
export const client = isValidConnectionString ? postgres(connectionString, { max: 1 }) : null;

// Initialize drizzle db instance
export const db = client ? drizzle(client, { schema }) : null;
