const fs = require('node:fs');

const branch = process.env.RELEASE_BRANCH;
const expected = {main: 3, 'release/v2': 2}[branch];
if (!expected) {
    throw new Error(`Unsupported release branch: ${branch}`);
}
const {name: packageName, version: packageVersion} = JSON.parse(
    fs.readFileSync('package.json', 'utf8'),
);
const stableVersion = new RegExp(`^${expected}\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$`);
for (const file of ['package.json', 'package-lock.json']) {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    const names = [manifest.name];
    if (file === 'package-lock.json') names.push(manifest.packages?.['']?.name);
    if (names.some((name) => typeof name !== 'string' || !name || name !== packageName)) {
        throw new Error(`${file}: package name does not match package.json`);
    }
    const versions = [manifest.version];
    if (file === 'package-lock.json') versions.push(manifest.packages?.['']?.version);
    for (const version of versions) {
        if (typeof version !== 'string' || !stableVersion.test(version)) {
            throw new Error(`${file}: expected stable ${expected}.x on ${branch}, got ${version}`);
        }
        if (version !== packageVersion) {
            throw new Error(`${file}: version does not match package.json`);
        }
    }
}
