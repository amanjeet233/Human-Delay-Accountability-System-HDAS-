import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cfgPath = path.resolve(__dirname, 'config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));

const logPathArg = process.argv[2] || process.env.VALIDATE_LOG || 'backend/logs/validate-run.log';
const logPath = path.resolve(process.cwd(), logPathArg);

if (!fs.existsSync(logPath)) {
  console.error(chalk.red(`Log file not found: ${logPath}`));
  process.exit(2);
}

const log = fs.readFileSync(logPath, 'utf-8');
const lines = log.split(/\r?\n/);

const findings = [];
let greenSignals = { validatorComplete: false, appStarted: false, tomcatPort: null, healthChecks: false };

function addFinding(type, table, column, detail) {
  const entity = cfg.tableEntityMap?.[table] || 'UnknownEntity';
  findings.push({ type, table, column, entity, detail });
}

// Patterns
const patterns = [
  {
    name: 'missing-table',
    regex: /Schema-validation:\s*missing table\s*\[(.+?)\]/i,
    handler: (m) => addFinding('Missing Table', m[1], null, m[0])
  },
  {
    name: 'missing-column',
    regex: /Schema-validation:\s*missing column\s*\[(.+?)\.(.+?)\]/i,
    handler: (m) => addFinding('Missing Column', m[1], m[2], m[0])
  },
  {
    name: 'wrong-type',
    regex: /Schema-validation:\s*wrong column type\s*for column\s*\[(.+?)\.(.+?)\]/i,
    handler: (m) => addFinding('Wrong Type', m[1], m[2], m[0])
  },
  {
    name: 'bean-failure',
    regex: /BeanCreationException:.*entityManagerFactory/i,
    handler: (m) => addFinding('Bean Init Failure', 'unknown', null, m[0])
  },
  {
    name: 'schema-mgmt-ex',
    regex: /SchemaManagementException/i,
    handler: (m) => addFinding('Schema Mgmt Exception', 'unknown', null, m[0])
  }
];

// Green patterns
const greenPatterns = [
  { name: 'validator-complete-1', regex: /Schema (validator|validation) complete(d)?/i, handler: () => { greenSignals.validatorComplete = true; } },
  { name: 'validator-complete-2', regex: /HHH\d{6}:\s*Schema (validator|validation) complete(d)?/i, handler: () => { greenSignals.validatorComplete = true; } },
  { name: 'app-started', regex: /Started .* in .* seconds/i, handler: () => { greenSignals.appStarted = true; } },
  { name: 'tomcat-port', regex: /Tomcat initialized with port\(s\):\s*(\d+)/i, handler: (m) => { greenSignals.tomcatPort = m[1]; } }
];

for (const line of lines) {
  for (const p of patterns) {
    const m = line.match(p.regex);
    if (m) {
      p.handler(m);
    }
  }
  for (const gp of greenPatterns) {
    const gm = line.match(gp.regex);
    if (gm) {
      gp.handler(gm);
    }
  }
}

if (findings.length === 0) {
  if (greenSignals.validatorComplete && greenSignals.appStarted) {
    console.log(chalk.green('No validation blockers. Validator completed and app started.'));
    if (greenSignals.tomcatPort) {
      console.log(chalk.green(`Tomcat initialized on port ${greenSignals.tomcatPort}.`));
    }
    process.exit(0);
  } else {
    console.log(chalk.yellow('No blockers found, but green signals incomplete. Review logs manually.'));
    process.exit(0);
  }
}

console.log(chalk.red(`Found ${findings.length} validation issue(s):`));
for (const f of findings) {
  const loc = f.column ? `${f.table}.${f.column}` : f.table;
  console.log(`- ${chalk.yellow(f.type)} at ${chalk.cyan(loc)} (entity: ${chalk.magenta(f.entity)})`);
  console.log(`  ${chalk.gray(f.detail)}`);
}

console.log('\nSuggested next steps:');
console.log('- Cross-check the issue in MIGRATION_PHASE_3_VALIDATION.md and MIGRATION_PHASE_4.sql.');
console.log('- If it is an additive structure, ensure it was applied (rerun validator).');
console.log('- If type mismatch, align to JPA (e.g., UUID → BINARY(16)) in a controlled change.');
console.log('- If shadow/parallel structure is referenced, confirm table exists and entity mapping matches.');
console.log('- After fixes, re-run backend and this parser to confirm green signals (validator complete, app started, tomcat port).');

process.exit(1);
