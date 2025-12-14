import { spawn } from 'child_process';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const steps = [
  { name: 'Format', command: 'npm', args: ['run', 'format'] },
  { name: 'Lint', command: 'npm', args: ['run', 'lint'] },
  { name: 'Typecheck', command: 'npm', args: ['run', 'typecheck'] },
  { name: 'Test', command: 'npm', args: ['test'] },
  { name: 'Build', command: 'npm', args: ['run', 'build'] },
  { name: 'E2E Tests', command: 'npm', args: ['run', 'test:e2e'] }
];

async function runStep(step) {
  return new Promise((resolve) => {
    process.stdout.write(`${colors.cyan}Running ${step.name}...${colors.reset} `);

    const startTime = Date.now();
    // Use shell: true for Windows compatibility with npm
    const child = spawn(step.command, step.args, { shell: true, stdio: 'pipe' });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (code === 0) {
        console.log(
          `${colors.green}✓ Passed${colors.reset} ${colors.gray}(${duration}s)${colors.reset}`
        );
        resolve({ success: true, name: step.name, duration });
      } else {
        console.log(
          `${colors.red}✗ Failed${colors.reset} ${colors.gray}(${duration}s)${colors.reset}`
        );
        console.log(`\n${colors.yellow}--- ${step.name} Output ---${colors.reset}`);
        console.log(output);
        console.log(errorOutput);
        console.log(`${colors.yellow}---------------------${colors.reset}\n`);
        resolve({ success: false, name: step.name, duration });
      }
    });
  });
}

async function main() {
  console.log(`${colors.cyan}🚀 Starting Pre-commit Verification${colors.reset}\n`);

  const results = [];
  let allPassed = true;

  for (const step of steps) {
    const result = await runStep(step);
    results.push(result);
    if (!result.success) {
      allPassed = false;
      // Option: stop on failure? User said "we can run separately to understand", implying run all might be nice,
      // but usually build fails if types fail. Let's continue to show full report.
    }
  }

  console.log(`\n${colors.cyan}--- Summary ---${colors.reset}`);
  results.forEach((res) => {
    const icon = res.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${icon} ${res.name.padEnd(12)} ${colors.gray}${res.duration}s${colors.reset}`);
  });

  if (allPassed) {
    console.log(`\n${colors.green}✨ All checks passed! Ready to push.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}💥 Some checks failed. Please review the errors above.${colors.reset}`
    );
    process.exit(1);
  }
}

main();
