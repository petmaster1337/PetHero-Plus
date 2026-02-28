const fs = require('fs');
const path = require('path');

module.exports = function createLocalProperties({ logger }) {
  const sdkDir = process.env.ANDROID_HOME || `${process.env.HOME}/Library/Android/sdk`;
  const localPropertiesPath = path.join(process.cwd(), 'android', 'local.properties');

  logger.info(`🔧 Writing sdk.dir to local.properties: ${sdkDir}`);

  fs.writeFileSync(
    localPropertiesPath,
    `sdk.dir=${sdkDir.replace(/\\/g, '/')}\n`,
    'utf-8'
  );
};
