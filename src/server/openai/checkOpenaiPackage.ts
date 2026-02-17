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
                `Пакет ${packageName} не установлен. Установите его с помощью: npm install ${packageName}@${versionRange}`,
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
                `Установлен пакет ${packageName}@${pkgVersion}, но требуется версия ${versionRange}`,
            );
        }
    } catch (err) {
        throw new Error(
            `Не найдена или не поддерживается необходимая зависимость: openai. Установите совместимую версию: ^6.21.0\n${err}`,
        );
    }
};
