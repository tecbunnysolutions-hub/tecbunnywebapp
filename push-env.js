const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

const projects = ['api', 'tecbunny', 'waba', 'superadmin', 'mgmt'];
const envPath = path.join(__dirname, '.env');

console.log('Reading .env file...');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = [];
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const splitIndex = trimmed.indexOf('=');
    if (splitIndex > 0) {
      const key = trimmed.substring(0, splitIndex).trim();
      let value = trimmed.substring(splitIndex + 1).trim();
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      envVars.push({ key, value });
    }
  }
});

console.log(`Found ${envVars.length} variables to sync.`);

for (const project of projects) {
  console.log(`\n========================================`);
  console.log(`Syncing project: ${project}`);
  console.log(`========================================`);
  
  const tempDir = path.join(__dirname, `.temp-${project}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  try {
    console.log(`Linking...`);
    spawnSync('vercel', ['link', '--project', project, '--yes'], { cwd: tempDir, stdio: 'pipe' });
    
    let count = 1;
    for (const { key, value } of envVars) {
      console.log(`[${count++}/${envVars.length}] Adding ${key}...`);
      try {
        spawnSync('vercel', ['env', 'rm', key, '--yes'], { cwd: tempDir, stdio: 'ignore' }); // Remove if exists
      } catch (e) {
        // Ignore if it doesn't exist
      }
      try {
        spawnSync('vercel', ['env', 'add', key, 'production', '--value', value, '--yes'], { cwd: tempDir, stdio: 'ignore' });
      } catch (err) {
        console.error(`Failed to add ${key}:`, err.message);
      }
    }
    console.log(`Successfully synced ${project}!`);
  } catch (err) {
    console.error(`Failed to sync ${project}:`, err.message);
  } finally {
    // Cleanup with error handling for Windows EPERM issues
    try {
      fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
    } catch (e) {
      console.log(`Warning: Could not remove ${tempDir} right away due to locked files.`);
    }
  }
}

console.log('\nAll projects synced successfully!');
