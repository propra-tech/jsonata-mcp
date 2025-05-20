#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mainPath = resolve(__dirname, '../dist/index.js');

// Execute the file directly with Node.js
const childProcess = spawn('node', [mainPath], { stdio: 'inherit' });

childProcess.on('close', (code) => {
  process.exit(code);
});
