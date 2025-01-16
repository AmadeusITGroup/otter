const fs = require('fs');
const path = require('path');

function resolveConflict(content) {
    const conflictRegex = /<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> main/g;
    return content.replace(conflictRegex, (match, headContent, mainContent) => {
        const headDependencies = parseDependencies(headContent);
        const mainDependencies = parseDependencies(mainContent);

        const resolvedDependencies = {};
        for (const [dep, version] of Object.entries(headDependencies)) {
            if (mainDependencies[dep]) {
                resolvedDependencies[dep] = compareVersions(version, mainDependencies[dep]);
            } else {
                resolvedDependencies[dep] = version;
            }
        }

        for (const [dep, version] of Object.entries(mainDependencies)) {
            if (!resolvedDependencies[dep]) {
                resolvedDependencies[dep] = version;
            }
        }

        return formatDependencies(resolvedDependencies);
    });
}

function parseDependencies(content) {
    const dependencies = {};
    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
        if (match) {
            dependencies[match[1]] = match[2];
        }
    }
    return dependencies;
}

function compareVersions(version1, version2) {
    const v1 = version1.replace(/[~^]/, '').split('.').map(Number);
    const v2 = version2.replace(/[~^]/, '').split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        if ((v1[i] || 0) > (v2[i] || 0)) return version1;
        if ((v1[i] || 0) < (v2[i] || 0)) return version2;
    }
    return version1;
}

function formatDependencies(dependencies) {
    return Object.entries(dependencies)
        .map(([dep, version]) => `    "${dep}": "${version}",`)
        .join('\n');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const resolvedContent = resolveConflict(content);
        fs.writeFileSync(filePath, resolvedContent, 'utf8');
        console.log(`Resolved conflicts in ${filePath}`);
    } catch (error) {
        console.error(`Error processing file ${filePath}: ${error.message}`);
    }
}

function findPackageJsonFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findPackageJsonFiles(fullPath);
        } else if (file === 'package.json') {
            processFile(fullPath);
        }
    }
}

findPackageJsonFiles(process.cwd());