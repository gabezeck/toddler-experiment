#!/usr/bin/env node

/**
 * DialogFlow AI - Setup Verification Script
 * 
 * This script verifies that your development environment is properly configured.
 * Run with: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const symbols = {
  pass: `${colors.green}✓${colors.reset}`,
  fail: `${colors.red}✗${colors.reset}`,
  warn: `${colors.yellow}⚠${colors.reset}`,
  info: `${colors.blue}ℹ${colors.reset}`,
};

let passed = 0;
let failed = 0;
let warnings = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}`, colors.cyan);
  log(`${title}`, colors.cyan);
  log(`${'='.repeat(50)}${colors.reset}\n`);
}

function pass(message) {
  log(`${symbols.pass} ${message}`, colors.green);
  passed++;
}

function fail(message, suggestion = '') {
  log(`${symbols.fail} ${message}`, colors.red);
  if (suggestion) {
    log(`  ${colors.yellow}→ ${suggestion}`, colors.yellow);
  }
  failed++;
}

function warn(message) {
  log(`${symbols.warn} ${message}`, colors.yellow);
  warnings++;
}

function info(message) {
  log(`${symbols.info} ${message}`, colors.blue);
}

function checkNodeVersion() {
  section('Checking Node.js');

  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 18) {
      pass(`Node.js version: ${version} (>= 18 required)`);
      return true;
    } else {
      fail(`Node.js version: ${version} (>= 18 required)`);
      fail('  Install Node.js 18 or later from https://nodejs.org/');
      return false;
    }
  } catch (error) {
    fail('Node.js not found');
    fail('  Install Node.js 18 or later from https://nodejs.org/');
    return false;
  }
}

function checkPythonVersion() {
  section('Checking Python');

  try {
    const pythonCommands = ['python3', 'python', 'py'];
    let pythonCmd = null;
    let version = null;

    for (const cmd of pythonCommands) {
      try {
        version = execSync(`${cmd} --version`, { encoding: 'utf8' });
        pythonCmd = cmd;
        break;
      } catch {
        continue;
      }
    }

    if (!version) {
      throw new Error('Python not found');
    }

    const versionMatch = version.match(/Python (\d+)\.(\d+)/);
    if (!versionMatch) {
      throw new Error('Could not parse Python version');
    }

    const major = parseInt(versionMatch[1]);
    const minor = parseInt(versionMatch[2]);

    if (major > 3 || (major === 3 && minor >= 9)) {
      pass(`Python version: ${version.trim()} (>= 3.9 required)`);
      pass(`  Using command: ${pythonCmd}`);
      return true;
    } else {
      fail(`Python version: ${version.trim()} (>= 3.9 required)`);
      fail('  Install Python 3.9 or later from https://www.python.org/');
      return false;
    }
  } catch (error) {
    fail('Python not found');
    fail('  Install Python 3.9 or later from https://www.python.org/');
    return false;
  }
}

function checkPnpm() {
  section('Checking pnpm');

  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' });
    pass(`pnpm version: ${version.trim()}`);
    return true;
  } catch (error) {
    fail('pnpm not found');
    fail('  Install pnpm: npm install -g pnpm');
    return false;
  }
}

function checkFrontendDependencies() {
  section('Checking Frontend Dependencies');

  const nodeModulesPath = path.join(__dirname, '..', 'frontend', 'node_modules');
  const packageLockPath = path.join(__dirname, '..', 'frontend', 'pnpm-lock.yaml');

  if (fs.existsSync(nodeModulesPath)) {
    pass('Frontend dependencies installed (node_modules exists)');
    return true;
  } else {
    fail('Frontend dependencies not installed');
    fail('  Run: cd frontend && pnpm install');
    return false;
  }
}

function checkPythonDependencies() {
  section('Checking Python Dependencies');

  const venvPath = path.join(__dirname, '..', '.venv');
  const hasVenv = fs.existsSync(venvPath);

  try {
    // Try to import autogen to see if it's installed
    const result = execSync('python3 -c "import autogen" 2>&1', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (hasVenv) {
      pass('Python dependencies installed');
      pass('  Virtual environment found: .venv/');
    } else {
      warn('Python dependencies installed, but no virtual environment found');
      warn('  Consider using: python3 -m venv .venv');
    }
    return true;
  } catch (error) {
    fail('Python dependencies not installed');
    if (hasVenv) {
      fail('  Activate venv and run: source .venv/bin/activate && pip install -r requirements.txt');
    } else {
      fail('  Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt');
    }
    return false;
  }
}

function checkPlaywright() {
  section('Checking Playwright Browsers');

  try {
    const result = execSync('python3 -c "from playwright.sync_api import sync_playwright" 2>&1', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    info('Playwright Python package installed');
    
    // Check if browsers are installed
    try {
      execSync('python3 -m playwright install --help 2>&1', { stdio: 'pipe' });
      pass('Playwright installed (browsers may need installation)');
      info('  Run "playwright install" if web-surfing agent has issues');
      return true;
    } catch {
      fail('Playwright browsers not installed');
      fail('  Run: playwright install');
      return false;
    }
  } catch (error) {
    fail('Playwright not installed');
    fail('  Install with: pip install playwright');
    return false;
  }
}

function checkEnvFile() {
  section('Checking Environment Configuration');

  const envPath = path.join(__dirname, '..', 'frontend', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  if (fs.existsSync(envPath)) {
    pass('.env file exists');
    
    // Check for OpenAI API key
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('OPENAI_API_KEY=sk-')) {
      pass('OpenAI API key configured');
      
      // Validate format (basic check for sk- prefix)
      const match = envContent.match(/OPENAI_API_KEY=(sk-[a-zA-Z0-9-]+)/);
      if (match && match[1].length > 20) {
        pass('OpenAI API key format looks valid');
        return true;
      } else {
        warn('OpenAI API key format may be invalid');
        warn('  Should start with "sk-" and be at least 20 characters');
        return false;
      }
    } else if (envContent.includes('OPENAI_API_KEY=your-key-here') || envContent.includes('OPENAI_API_KEY=sk-your-key-here')) {
      fail('OpenAI API key not configured (placeholder found)');
      fail('  Add your key to frontend/.env or get one from https://platform.openai.com/api-keys');
      return false;
    } else {
      fail('OpenAI API key not found in .env');
      fail('  Add: OPENAI_API_KEY=sk-your-actual-key-here');
      return false;
    }
  } else {
    fail('.env file not found');
    if (fs.existsSync(envExamplePath)) {
      fail('  Copy .env.example to frontend/.env and add your API key');
      fail('  Run: cp .env.example frontend/.env');
    } else {
      fail('  Create frontend/.env with your OpenAI API key');
    }
    fail('  Get your key from: https://platform.openai.com/api-keys');
    return false;
  }
}

function checkProjectStructure() {
  section('Checking Project Structure');

  const requiredDirs = ['frontend', 'frontend/app', 'frontend/components'];
  const requiredFiles = [
    'frontend/package.json',
    'requirements.txt',
    'main.py',
    'README.md',
  ];

  let allGood = true;

  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      pass(`Directory exists: ${dir}/`);
    } else {
      fail(`Directory missing: ${dir}/`);
      allGood = false;
    }
  }

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      pass(`File exists: ${file}`);
    } else {
      fail(`File missing: ${file}`);
      allGood = false;
    }
  }

  return allGood;
}

function printSummary() {
  section('Summary');

  const total = passed + failed + warnings;
  const status = failed === 0 ? 
    `${colors.green}✓ Setup Complete!${colors.reset}` :
    `${colors.red}✗ Setup Incomplete${colors.reset}`;

  log(`\n${status}\n`);
  log(`  Passed:  ${colors.green}${passed}${colors.reset}`);
  log(`  Warnings: ${colors.yellow}${warnings}${colors.reset}`);
  log(`  Failed:  ${colors.red}${failed}${colors.reset}`);
  log(`  Total:   ${total}\n`);

  if (failed === 0 && warnings === 0) {
    log(`${colors.green}${colors.bold}✓ Your development environment is ready!${colors.reset}\n`);
    log('You can now run:');
    log(`  ${colors.cyan}cd frontend && pnpm dev${colors.reset}\n`);
  } else if (failed === 0) {
    log(`${colors.yellow}Setup complete with warnings.${colors.reset}\n`);
    log('You can start development, but consider addressing the warnings above.\n');
  } else {
    log(`${colors.red}${colors.bold}Please fix the issues above before continuing.${colors.reset}\n`);
    log(`For help, see: ${colors.cyan}https://github.com/yourusername/toddler-experiment${colors.reset}\n`);
  }

  log(`${'='.repeat(50)}\n`);
}

// Main execution
function main() {
  console.log('');
  log(`${colors.bold}${colors.cyan}DialogFlow AI - Setup Verification${colors.reset}`);
  log(`Checking your development environment...\n`);

  // Run all checks
  checkNodeVersion();
  checkPnpm();
  checkPythonVersion();
  checkFrontendDependencies();
  checkPythonDependencies();
  checkPlaywright();
  checkEnvFile();
  checkProjectStructure();

  // Print summary
  printSummary();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
