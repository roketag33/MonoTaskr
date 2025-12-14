const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const distDir = path.join(__dirname, '../dist');
const zipFile = path.join(__dirname, '../dist.zip');

console.log('📦 Zipping dist folder...');

// Check if powershell is available (Windows)
exec(
  `powershell Compress-Archive -Path "${distDir}/*" -DestinationPath "${zipFile}" -Force`,
  (error, stdout, stderr) => {
    if (error) {
      console.log(
        '⚠️ PowerShell zip failed, trying basic node zip logic (if implemented) or warning user.'
      );
      console.error('Error:', error.message);
      console.error('Stderr:', stderr);
      // Fallback or exit
      process.exit(1);
    } else {
      console.log('✅ Created dist.zip');
    }
  }
);
