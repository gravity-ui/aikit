export const checkOpenaiPackage = async () => {
    try {
        const packageName = 'openai';
        const versionRange = '>=6.21.0 || <7.0.0'; // Required version from package.json

        // Try to require the openai package
        let openaiPkg;
        try {
            openaiPkg = await import(packageName);
        } catch {
            throw new Error(
                `The package ${packageName} is not installed. Please install it using: npm install ${packageName}@${versionRange}`,
            );
        }

        // Try to get the package version
        let pkgVersion;
        try {
            pkgVersion = (await import(`${packageName}/version`)).VERSION;
        } catch {
            // If we can't get the version from package.json, try to get it from the package itself
            pkgVersion = openaiPkg.version || 'unknown';
        }

        // Check if the version satisfies the requirement
        const semver = await import('semver');
        if (!semver.satisfies(pkgVersion, versionRange)) {
            throw new Error(
                `The package ${packageName}@${pkgVersion} is installed, but version ${versionRange} is required.`,
            );
        }
    } catch (err) {
        throw new Error(
            `The required dependency "openai" was not found or is not supported. Please install a compatible version: ^6.21.0\n${err}`,
        );
    }
};
