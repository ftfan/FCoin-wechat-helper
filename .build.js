const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const outDir = 'dist';

const copyFiles = [
  'package.json'
];
// tsc.

// 执行输出
// execSync(`tsc --outDir ${outDir}`, {
//   cwd: path.join(__dirname),
//   stdio: process.stdio,
// });

copyFiles.forEach((file) => {
  const readStream = fs.createReadStream(path.join(__dirname, file));
  const writeStream = fs.createWriteStream(path.join(__dirname, outDir, file));
  readStream.pipe(writeStream);
});
