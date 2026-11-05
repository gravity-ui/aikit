const {test} = require('node:test');
const assert = require('node:assert/strict');
const {mkdtempSync, writeFileSync, rmSync} = require('node:fs');
const {tmpdir} = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

function check(branch, version, lockVersion = version, rootVersion = lockVersion) {
    const cwd = mkdtempSync(path.join(tmpdir(), 'aikit-release-'));
    try {
        writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({version}));
        writeFileSync(
            path.join(cwd, 'package-lock.json'),
            JSON.stringify({
                version: lockVersion,
                packages: {'': {version: rootVersion}},
            }),
        );
        return spawnSync(process.execPath, [path.join(__dirname, 'check-major.cjs')], {
            cwd,
            env: {...process.env, RELEASE_BRANCH: branch},
            encoding: 'utf8',
        }).status;
    } finally {
        rmSync(cwd, {recursive: true, force: true});
    }
}

test('accepts independent stable release lines', () => {
    assert.equal(check('main', '3.1.0'), 0);
    assert.equal(check('release/v2', '2.29.0'), 0);
});
test('rejects wrong majors, prereleases and unsupported branches', () => {
    for (const [branch, version] of [
        ['main', '2.29.0'],
        ['main', '4.0.0'],
        ['release/v2', '3.0.0'],
        ['release/v2', '2.29.0-beta.0'],
        ['main', '3.01.0'],
        ['main', '3.1.00'],
        ['main', '3.1.0+build'],
        ['release/v3', '3.0.0'],
    ])
        assert.notEqual(check(branch, version), 0);
});
test('rejects inconsistent or missing lockfile versions', () => {
    assert.notEqual(check('main', '3.1.0', '3.0.0'), 0);
    assert.notEqual(check('main', '3.1.0', '3.1.0', '3.0.0'), 0);
    assert.notEqual(check('main', '3.1.0', '3.1.0', null), 0);
});
