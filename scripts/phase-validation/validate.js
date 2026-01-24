import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cfgPath = path.resolve(__dirname, 'config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'hdas'
} = process.env;

function fmt(issue, ok) {
  const icon = ok ? chalk.green('✔') : chalk.red('✖');
  return `${icon} ${issue}`;
}

async function existsTable(conn, schema, table) {
  const [rows] = await conn.execute(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [schema, table]
  );
  return rows.length > 0;
}

async function existsColumn(conn, schema, table, column, type, length) {
  const [rows] = await conn.execute(
    'SELECT data_type, character_maximum_length, numeric_precision FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [schema, table, column]
  );
  if (rows.length === 0) return false;
  if (!type) return true;
  const row = rows[0];
  const dt = String(row.data_type || '').toLowerCase();
  if (type === 'binary' && length === 16) {
    // MySQL shows BINARY length
    return dt === 'binary' && (row.character_maximum_length === 16 || row.numeric_precision === 16);
  }
  return dt === type.toLowerCase();
}

async function existsUniqueIndex(conn, schema, table, columns) {
  const [rows] = await conn.execute(
    'SELECT index_name, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS cols FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? GROUP BY index_name, non_unique',
    [schema, table]
  );
  const target = columns.join(',');
  return rows.some(r => r.non_unique === 0 && String(r.cols).toLowerCase() === target.toLowerCase());
}

async function getColumnType(conn, schema, table, column) {
  const [rows] = await conn.execute(
    'SELECT data_type, character_maximum_length, numeric_precision FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [schema, table, column]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    dataType: String(row.data_type || '').toLowerCase(),
    charLen: row.character_maximum_length,
    numPrec: row.numeric_precision
  };
}

function typeMatches(actual, required) {
  if (!required || !actual) return false;
  const reqType = String(required.type || '').toLowerCase();
  if (reqType === 'binary' && required.length === 16) {
    return actual.dataType === 'binary' && (actual.charLen === 16 || actual.numPrec === 16);
  }
  if (reqType) {
    return actual.dataType === reqType;
  }
  return true;
}

async function existsForeignKey(conn, schema, table, column, refTable, refColumn) {
  const [rows] = await conn.execute(
    'SELECT constraint_name FROM information_schema.key_column_usage WHERE table_schema = ? AND table_name = ? AND column_name = ? AND referenced_table_name = ? AND referenced_column_name = ? LIMIT 1',
    [schema, table, column, refTable, refColumn]
  );
  return rows.length > 0;
}

async function main() {
  console.log(chalk.cyan('HDAS Phase-4 Validation: Checking schema presence for Hibernate validate...'));
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  });

  let ok = true;

  // Tables
  for (const t of cfg.tables) {
    const present = await existsTable(conn, MYSQL_DATABASE, t);
    console.log(fmt(`Table ${t} exists`, present));
    ok = ok && present;
  }

  // Columns
  for (const c of cfg.columns) {
    const present = await existsColumn(conn, MYSQL_DATABASE, c.table, c.name, c.type, c.length);
    console.log(fmt(`Column ${c.table}.${c.name} (${c.type || 'any'})`, present));
    ok = ok && present;
  }

  // UUID columns
  for (const u of cfg.uuidColumns) {
    const present = await existsColumn(conn, MYSQL_DATABASE, u.table, u.name, 'binary', 16);
    console.log(fmt(`UUID column ${u.table}.${u.name} (BINARY(16))`, present));
    ok = ok && present;
  }

  // Unique indexes
  for (const idx of cfg.uniqueIndexes) {
    const present = await existsUniqueIndex(conn, MYSQL_DATABASE, idx.table, idx.columns);
    console.log(fmt(`Unique index ${idx.table}(${idx.columns.join(',')})`, present));
    ok = ok && present;
  }

  // Optional FKs with type preconditions
  if (Array.isArray(cfg.foreignKeysOptional)) {
    for (const fk of cfg.foreignKeysOptional) {
      const colType = await getColumnType(conn, MYSQL_DATABASE, fk.table, fk.column);
      const refType = await getColumnType(conn, MYSQL_DATABASE, fk.refTable, fk.refColumn);

      const colMatches = typeMatches(colType, fk.requireType?.column);
      const refMatches = typeMatches(refType, fk.requireType?.ref);

      if (!colMatches || !refMatches) {
        console.log(`${chalk.yellow('⚠')} Skipping FK check ${fk.table}.${fk.column} → ${fk.refTable}.${fk.refColumn} due to type mismatch or absence.`);
        continue; // non-blocking
      }

      const present = await existsForeignKey(conn, MYSQL_DATABASE, fk.table, fk.column, fk.refTable, fk.refColumn);
      if (present) {
        console.log(fmt(`FK ${fk.table}.${fk.column} → ${fk.refTable}.${fk.refColumn}`, true));
      } else {
        console.log(`${chalk.magenta('!')} Missing optional FK ${fk.table}.${fk.column} → ${fk.refTable}.${fk.refColumn}`);
      }
      // Note: optional FK checks do not affect overall ok result
    }
  }

  await conn.end();
  if (!ok) {
    console.error(chalk.red('\nValidation blockers found. Ensure Phase-4 SQL applied in correct order.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\nSchema ready for ddl-auto=validate.'));
  }
}

main().catch(err => {
  console.error(chalk.red('Error during validation:'), err);
  process.exit(2);
});
