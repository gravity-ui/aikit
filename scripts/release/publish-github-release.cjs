module.exports = async function publishRelease({github, repo, branch, releaseId, version}) {
    const major = {main: 3, 'release/v2': 2}[branch];
    if (!major || !new RegExp(`^${major}\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$`).test(version)) {
        throw new Error('Unsupported release branch or version');
    }
    if (!Number.isSafeInteger(releaseId) || releaseId <= 0) {
        throw new Error('Invalid GitHub release ID');
    }
    const {data: release} = await github.rest.repos.getRelease({...repo, release_id: releaseId});
    if (release.tag_name !== `v${version}` || release.prerelease) {
        throw new Error('GitHub release does not match the stable package version');
    }
    await github.rest.repos.updateRelease({
        ...repo,
        release_id: releaseId,
        draft: false,
        make_latest: branch === 'main' ? 'true' : 'false',
    });
    await github.rest.git.getRef({...repo, ref: `tags/v${version}`});
};
