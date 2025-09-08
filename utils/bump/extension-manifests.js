#!/usr/bin/env node

// Bumps extension manifests if changes detected + git commit/push

// NOTE: Pass --cache to use cachePaths.manifestPaths for faster init
// NOTE: Pass --dev to not use cachePaths.bumpUtils for latest ver
// NOTE: Pass --chrom<e|ium> to forcibly bump Chromium manifests only
// NOTE: Pass --<ff|firefox> to forcibly bump Firefox manifests only
// NOTE: Pass --no-<commit|push> to skip git commit/push

(async () => {

    // Parse ARGS
    const args = process.argv.slice(2),
          cacheMode = args.some(arg => arg.startsWith('--cache')),
          devMode = args.some(arg => arg.startsWith('--dev')),
          chromiumOnly = args.some(arg => /chrom/i.test(arg)),
          ffOnly = args.some(arg => /f{2}/i.test(arg)),
          noCommit = args.some(arg => ['--no-commit', '-nc'].includes(arg)),
          noPush = args.some(arg => ['--no-push', '-np'].includes(arg))

    // Import LIBS
    const fs = require('fs'),
          path = require('path'),
          { execSync, spawnSync } = require('child_process')

    // Init CACHE paths
    const cachePaths = { root: '.cache/' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}bump-utils.min.mjs`)
    cachePaths.manifestPaths = path.join(__dirname, `${cachePaths.root}manifest-paths.json`)

    // Import BUMP UTILS
    let bump
    if (devMode) // bypass cache for latest bump-utils.mjs
        bump = await import('./bump-utils.mjs')
    else { // import sparsely updated remote bump-utils.min.mjs
        fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
        fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
            'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs')).text()
        ).replace(/^\/\*\*[\s\S]*?\*\/\s*/, '')) // strip JSD header minification comment
        bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)
    }

    // Collect extension manifests
    bump.log.working(`\n${ cacheMode ? 'Collecting' : 'Searching for' } extension manifests...\n`)
    let manifestPaths = []
    if (cacheMode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.manifestPaths), { recursive: true })
            const fd = fs.openSync(cachePaths.manifestPaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.error(`Cache file missing. Generating ${cachePaths.manifestPaths}...\n`)
            manifestPaths = await bump.findFileBySuffix({ suffix: 'manifest.json' }) ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(manifestPaths, null, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.manifestPaths}`)
        } catch (err) { // use existing cache file
            manifestPaths = JSON.parse(fs.readFileSync(cachePaths.manifestPaths, 'utf-8'))
            console.log(manifestPaths) ; console.log('')
        }
    } else { // use bump.findFileBySuffix()
        manifestPaths = await bump.findFileBySuffix({ suffix: 'manifest.json' }) ; console.log('') }

    // Filter manifests by platform if specified
    if (chromiumOnly) manifestPaths = manifestPaths.filter(path => /chrom/i.test(path))
    else if (ffOnly) manifestPaths = manifestPaths.filter(path => /firefox/i.test(path))

    // Extract extension project NAMES
    bump.log.working('\nExtracting extension project names...\n')
    const projectNames = {}
    manifestPaths.forEach(manifestPath => {
        const projectName = manifestPath.split(/[\\/]/)[3] ; if (projectName) projectNames[projectName] = true })
    const sortedProjects = Object.keys(projectNames).sort((a, b) => a.localeCompare(b))
    sortedProjects.forEach(project => console.log(project))
    console.log('') // line break

    // Iterate thru PROJECTS
    const bumpedManifests = {}
    for (const projectName of sortedProjects) {
        bump.log.working(`Processing ${projectName}...\n`)

        // Iterate thru extension paths
        for (const manifestPath of manifestPaths) {
            if (!manifestPath.includes(`${projectName}`)) continue

            // Check latest commit for extension changes if forcible platform flag not set
            const platformManifestPath = path.dirname(manifestPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/'))
            if (!chromiumOnly && !ffOnly) {
                console.log(`Checking last commit details for ${platformManifestPath}...`)
                try {
                    const latestCommitMsg = spawnSync('git',
                        ['log', '-1', '--format=%s', '--', path.relative(process.cwd(), path.dirname(manifestPath))],
                        { encoding: 'utf8' }
                    ).stdout.trim()
                    bump.log.hash(`${latestCommitMsg}\n`)
                    if (/bump.*(?:ersion|manifest)/i.test(latestCommitMsg)) {
                        console.log('No changes found. Skipping...\n') ; continue }
                } catch (err) { bump.log.error('Error checking git history\n') }
            }

            console.log(`Bumping version in ${ chromiumOnly ? 'Chromium' : ffOnly ? 'Firefox' : '' } manifest...`)
            const { oldVer, newVer } = bump.bumpDateVer({ filePath: manifestPath })
            bumpedManifests[`${platformManifestPath}/manifest.json`] = `${oldVer};${newVer}`
        }
    }

    // LOG manifests bumped
    const pluralSuffix = Object.keys(bumpedManifests).length > 1 ? 's' : ''
    if (Object.keys(bumpedManifests).length == 0) {
           bump.log.info('Completed. No manifests bumped.') ; process.exit(0)
    } else bump.log.success(`${Object.keys(bumpedManifests).length} manifest${pluralSuffix} bumped!`)

    // ADD/COMMIT/PUSH bump(s)
    if (!noCommit) {
        bump.log.working(`\nCommitting bump${pluralSuffix} to Git...\n`)

        // Init commit msg
        let commitMsg = 'Bumped `version`' ; const uniqueVers = {}
        Object.values(bumpedManifests).forEach(vers => {
            const newVer = vers.split(';')[1] ; uniqueVers[newVer] = true })
        if (Object.keys(uniqueVers).length == 1)
            commitMsg += ` to \`${Object.keys(uniqueVers)[0]}\``

        // git add/commit/push
        try {
            execSync('git add ./**/manifest.json')
            spawnSync('git', ['commit', '-n', '-m', commitMsg], { stdio: 'inherit', encoding: 'utf-8' })
            if (!noPush) {
                bump.log.working('\nPulling latest changes from remote to sync local repository...\n')
                execSync('git pull')
                bump.log.working('\nPushing bump${pluralSuffix} to Git...\n')
                execSync('git push')
            }
            bump.log.success(`Success! ${Object.keys(bumpedManifests).length} manifest${pluralSuffix} updated${
                !noCommit ? '/committed' : '' }${ !noPush ? '/pushed' : '' } to GitHub`)
        } catch (err) { bump.log.error('Git operation failed: ' + err.message) }
    }

    // Final SUMMARY log
    console.log('') // line break
    Object.entries(bumpedManifests).forEach(([manifest, versions]) => {
        const [oldVer, newVer] = versions.split(';')
        console.log(`  ± ${manifest} ${
            bump.colors.bw}v${oldVer}${bump.colors.nc} → ${bump.colors.bg}v${newVer}${bump.colors.nc}`)
    })

})()
