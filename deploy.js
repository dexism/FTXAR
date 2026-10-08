/**
 * FTXAR 自動デプロイスクリプト (deploy.js)
 * 
 * 実行手順:
 * 1. clasp push -f (コード一式をGASプロジェクトにアップロード)
 * 2. clasp deploy -i <deploymentId> (既存の本番Web AppデプロイIDを更新し、URLを変えずに即時反映)
 */
const { execSync } = require('child_process');

const TARGET_DEPLOYMENT_ID = 'AKfycbz25fTqj6svcb-Hp0lYCwu2SO-_3SWLL4TEuGbBahM-8085u1Ar0n3unmJ32thZHmzR_g';
const WEB_APP_URL = `https://script.google.com/macros/s/${TARGET_DEPLOYMENT_ID}/exec`;

console.log("=========================================");
console.log("🚀 FTXAR Automated Deploy Pipeline");
console.log("=========================================\n");

try {
  console.log("▶ [Step 1/2] Pushing code to Google Apps Script...");
  execSync('clasp push -f', { stdio: 'inherit' });
  console.log("✅ Clasp push completed.\n");

  const timestamp = new Date().toISOString();
  console.log(`▶ [Step 2/2] Updating Production Deployment (${TARGET_DEPLOYMENT_ID})...`);
  const deployCmd = `clasp deploy -i "${TARGET_DEPLOYMENT_ID}" -d "FTXAR Auto Release - ${timestamp}"`;
  execSync(deployCmd, { stdio: 'inherit' });

  console.log("\n=========================================");
  console.log("🎉 SUCCESS: FTXAR successfully deployed to Production!");
  console.log("🔗 Web App URL: " + WEB_APP_URL);
  console.log("=========================================\n");
} catch (e) {
  console.error("❌ Deployment failed:", e.message);
  process.exit(1);
}
