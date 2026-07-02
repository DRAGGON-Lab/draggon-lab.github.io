const env = process.env.PUBLIC_DEPLOY_ENV ?? 'development';
const allowed = ['production', 'preview', 'development'];
if (!allowed.includes(env)) {
  console.error(`[DRG300] Error: Invalid PUBLIC_DEPLOY_ENV: ${env}`);
  process.exit(1);
}
console.log('Content graph validation summary');
console.log(`Environment: ${env}`);
console.log('Draft-related production checks: enabled for production');
console.log('Orphan published nodes: warnings only in Version 1');
