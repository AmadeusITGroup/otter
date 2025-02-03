const fs = require('fs');
const path = require('path');

function updatePeerDependencies(filePath) {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;

    if (packageJson.peerDependencies) {
        for (const [dep, version] of Object.entries(packageJson.peerDependencies)) {
            if (version.startsWith('~0.1900.')) {
                packageJson.peerDependencies[dep] = version.replace('~0.1900.', '^0.1900.');
                updated = true;
            }
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log(`Updated peerDependencies in ${filePath}`);
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
            updatePeerDependencies(fullPath);
        }
    }
}

findPackageJsonFiles(process.cwd());