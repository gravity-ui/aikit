const {test} = require('node:test');
const assert = require('node:assert/strict');
const publishRelease = require('./publish-github-release.cjs');

function fixture(branch, version, release = {tag_name: `v${version}`, prerelease: false}) {
    const updates = [];
    return {
        updates,
        args: {
            branch,
            version,
            releaseId: 42,
            repo: {owner: 'gravity-ui', repo: 'aikit'},
            github: {
                rest: {
                    repos: {
                        getRelease: async () => ({data: release}),
                        updateRelease: async (update) => updates.push(update),
                    },
                },
            },
        },
    };
}

test('publishes v3 as Latest and keeps v2 out of Latest', async () => {
    for (const [branch, version, latest] of [
        ['main', '3.0.2', 'true'],
        ['release/v2', '2.28.2', 'false'],
    ]) {
        const {args, updates} = fixture(branch, version);
        await publishRelease(args);
        assert.deepEqual(updates, [
            {owner: 'gravity-ui', repo: 'aikit', release_id: 42, draft: false, make_latest: latest},
        ]);
    }
});

test('refuses mismatched releases and prereleases before changing GitHub', async () => {
    for (const release of [{tag_name: 'v2.28.2'}, {tag_name: 'v3.0.2', prerelease: true}]) {
        const {args, updates} = fixture('main', '3.0.2', release);
        await assert.rejects(publishRelease(args));
        assert.deepEqual(updates, []);
    }
});

test('rejects unsupported branches, majors and missing release IDs', async () => {
    for (const overrides of [
        {branch: 'other'},
        {version: '2.28.2'},
        {releaseId: NaN},
        {version: '3.0.2-beta.0'},
    ]) {
        const {args, updates} = fixture('main', '3.0.2');
        await assert.rejects(publishRelease({...args, ...overrides}));
        assert.deepEqual(updates, []);
    }
});
