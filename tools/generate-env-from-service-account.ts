#!/usr/bin/env ts-node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

function getArg(flag: string, alias?: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  if (alias) {
    return getArg(alias);
  }
  return undefined;
}

function logUsageAndExit(message?: string): never {
  if (message) {
    // eslint-disable-next-line no-console
    console.error(message);
  }
  // eslint-disable-next-line no-console
  console.error(
    '\nUsage: npx ts-node tools/generate-env-from-service-account.ts --input <serviceAccount.json> [--output .env.local]\n',
  );
  process.exit(1);
}

const inputPath = getArg('--input', '-i') ?? process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
const outputPath = getArg('--output', '-o');

if (!inputPath) {
  logUsageAndExit('Missing service account JSON: pass --input or set FIREBASE_SERVICE_ACCOUNT_FILE.');
}

const resolvedInput = path.resolve(process.cwd(), inputPath);
if (!existsSync(resolvedInput)) {
  logUsageAndExit(`Service account file not found at ${resolvedInput}`);
}

const raw = readFileSync(resolvedInput, 'utf8');
let parsed: any;
try {
  parsed = JSON.parse(raw);
} catch (error) {
  logUsageAndExit('Invalid JSON in service account file.');
}

const projectId = parsed.project_id ?? '';
const privateKeyId = parsed.private_key_id ?? '';
const privateKeyRaw = typeof parsed.private_key === 'string' ? parsed.private_key : '';
const clientEmail = parsed.client_email ?? '';
const clientId = parsed.client_id ?? '';
const clientCertUrl = parsed.client_x509_cert_url ?? '';

const envReadyPrivateKey = privateKeyRaw.replace(/\r?\n/g, '\\n');

const lines = [
  `FIREBASE_PROJECT_ID=${projectId}`,
  `FIREBASE_PRIVATE_KEY_ID=${privateKeyId}`,
  `FIREBASE_PRIVATE_KEY="${envReadyPrivateKey}"`,
  `FIREBASE_CLIENT_EMAIL=${clientEmail}`,
  `FIREBASE_CLIENT_ID=${clientId}`,
  `FIREBASE_CLIENT_CERT_URL=${clientCertUrl}`,
  '',
  '# Optional: set if you prefer a single JSON blob instead of individual fields',
  '# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}',
  '',
  '# Remember to set JWT_SECRET and PORT as needed',
];

const output = lines.join('\n');

if (outputPath) {
  const resolvedOutput = path.resolve(process.cwd(), outputPath);
  writeFileSync(resolvedOutput, output, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote Firebase env block to ${resolvedOutput}`);
} else {
  // eslint-disable-next-line no-console
  console.log(output);
}
