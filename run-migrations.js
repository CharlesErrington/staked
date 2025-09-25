#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Supabase configuration
const SUPABASE_URL = 'https://stcvjnmqrdsvwvfhgudu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Y3Zqbm1xcmRzdnd2ZmhndWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODc4NDUsImV4cCI6MjA3MTE2Mzg0NX0.RN0Ci87SWW38uguIkN0RcVsbeDoGsDAxoHRf3Wu9teA';

console.log('⚠️  IMPORTANT: This script needs your Supabase service role key to run migrations.');
console.log('You can find it in your Supabase dashboard under Settings > API > service_role (secret)');
console.log('\nFor now, you need to run the migrations manually in the Supabase SQL Editor.');
console.log('\n📝 Steps to run migrations:');
console.log('1. Go to https://app.supabase.com/project/stcvjnmqrdsvwvfhgudu/sql/new');
console.log('2. Copy and paste each migration file (in order) from supabase/migrations/');
console.log('3. Click "Run" for each migration\n');

// List migration files
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log('Migration files to run (in this order):');
migrationFiles.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`);
});

console.log('\n✅ After running the migrations, your app should work properly!');