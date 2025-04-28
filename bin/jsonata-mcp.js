#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mainPath = resolve(__dirname, '../src/index.ts');

// Execute the TypeScript file directly with Node.js
const childProcess = spawn('node', [
  '--no-warnings',
  '--experimental-transform-types',
  mainPath
], {
  stdio: 'inherit'
});

childProcess.on('close', (code) => {
  process.exit(code);
});