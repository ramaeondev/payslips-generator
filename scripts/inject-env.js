const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const configFiles = {
  development: path.resolve(__dirname, '../src/config.dev.ts'),
  production: path.resolve(__dirname, '../src/config.prod.ts'),
};

const envVariables = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

// Validate required env vars early: fail the build if missing
if (!envVariables.SUPABASE_URL || envVariables.SUPABASE_URL.trim() === '') {
  console.error('Missing SUPABASE_URL env var. Set SUPABASE_URL in your build environment.');
  process.exit(1);
}
if (!envVariables.SUPABASE_ANON_KEY || envVariables.SUPABASE_ANON_KEY.trim() === '') {
  console.error(
    'Missing SUPABASE_ANON_KEY env var. Set SUPABASE_ANON_KEY in your build environment.',
  );
  process.exit(1);
}

const generateConfigFile = (filePath) => {
  const content = `export const config = {
  supabase: {
    url: '${envVariables.SUPABASE_URL}',
    anonKey: '${envVariables.SUPABASE_ANON_KEY}',
  },
};
`;

  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
};

generateConfigFile(configFiles.development);
generateConfigFile(configFiles.production);
