#!/usr/bin/env node

// Bumps extension manifests if changes detected + git commit/push

// NOTE: Pass --cache to use script.cache.paths.manifestPaths for faster init
// NOTE: Pass --chrom<e|ium> to forcibly bump Chromium manifests only
// NOTE: Pass --<ff|firefox> to forcibly bump Firefox manifests only
// NOTE: Pass --<no-<commit|push>|nc|np> to skip git commit/push

'use strict'

async function run() {

    const { execSync, spawnSync } = require('child_process'),
            fs = require('fs'),
            path = require('path')

    const args = process.argv.slice(2)

    const script = {
        cache: { paths: { root: '.cache' }, refs: {} },
        modes: {
            cache: args.some(arg => arg.startsWith('--cache')),
            chromiumOnly: args.some(arg => arg.startsWith('--chrom')),
            ffOnly: args.some(arg => /^--(?:f{2}|firefox)$/i.test(arg)),
            noCommit: args.some(arg => /^--(?:nc|no-?commit)$/.test(arg)),
            noPush: args.some(arg => /^--(?:np|no-?push)$/.test(arg))
        },
        urls: { bumpmjs: 'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions/utils/bump/lib/bump.min.mjs' },
        manifestSuffix: 'manifest.json'
    }
    script.cache.paths.bumpmjs = path.join(process.cwd(), `${script.cache.paths.root}/bump.min.mjs`)
    script.cache.paths.manifestPaths = path.join(process.cwd(), `${script.cache.paths.root}/manifest-paths.json`)
    const { cache: { paths: cachePaths }} = script

    // Import bump.mjs
    fs.mkdirSync(path.dirname(cachePaths.bumpmjs), { recursive: true })
    fs.writeFileSync(cachePaths.bumpmjs, (await (await fetch(script.urls.bumpmjs)).text()))
    const bump = await import(`file://${cachePaths.bumpmjs}`)
    fs.unlinkSync(cachePaths.bumpmjs)

    // Collect extension manifests
    bump.log.working(`\n${ script.modes.cache ? 'Collecting' : 'Searching for' } extension manifests...\n`)
    let manifestPaths
    if (script.modes.cache) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.manifestPaths), { recursive: true })
            const fd = fs.openSync(cachePaths.manifestPaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.info(`Cache file missing. Generating ${cachePaths.manifestPaths}...\n`)
            manifestPaths = await bump.findFileBySuffix({ suffix: script.manifestSuffix })
            console.log('')
            fs.writeFileSync(fd, JSON.stringify(manifestPaths, undefined, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.manifestPaths}`)
        } catch (err) { // use existing cache file
            manifestPaths = JSON.parse(fs.readFileSync(cachePaths.manifestPaths, 'utf-8'))
            console.log(manifestPaths)
            console.log('')
        }
    } else { // use bump.findFileBySuffix()
        manifestPaths = await bump.findFileBySuffix({ suffix: script.manifestSuffix })
        console.log('')
    }
    if (script.modes.chromiumOnly)
        manifestPaths = manifestPaths.filter(path => /chrom/i.test(path))
    else if (script.modes.ffOnly)
        manifestPaths = manifestPaths.filter(path => /firefox/i.test(path))

    bump.log.working('\nExtracting extension project names...\n')
    const projectNames = {}
    manifestPaths.forEach(path => { const name = path.split(/[\\/]/)[3] ; if (name) projectNames[name] = true })
    const sortedProjects = Object.keys(projectNames).sort((a, b) => a.localeCompare(b))
    sortedProjects.forEach(project => console.log(project))
    console.log('')

    // Iterate thru projects
    const bumpedManifests = {}
    for (const projectName of sortedProjects) {
        bump.log.working(`Processing ${projectName}...\n`)

        // Iterate thru extension paths
        for (const manifestPath of manifestPaths) {
            if (!manifestPath.includes(projectName)) continue

            // Check latest commit for extension changes if forcible platform flag not set
            const platformManifestPath = path.dirname(
                manifestPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/'))
            if (!script.modes.chromiumOnly && !script.modes.ffOnly) {
                console.log(`Checking last commit details for ${platformManifestPath}...`)
                try {
                    const latestCommitMsg = spawnSync('git',
                        ['log', '-1', '--format=%s', '--', path.relative(process.cwd(), path.dirname(manifestPath))],
                        { encoding: 'utf8' }
                    ).stdout.trim()
                    bump.log.hash(`${latestCommitMsg}\n`)
                    if (/bump.*(?:ersion|manifest)/i.test(latestCommitMsg)) {
                        console.log('No changes found. Skipping...\n')
                        continue
                    }
                } catch (err) {
                    bump.log.error('Error checking git history\n') }
            }

            console.log(`Bumping version in ${
                script.modes.chromiumOnly ? 'Chromium' : script.modes.ffOnly ? 'Firefox' : '' } manifest...`)
            const { oldVer, newVer } = bump.bumpVersion({ format: 'dateVer', filePath: manifestPath })
            bumpedManifests[`${platformManifestPath}/manifest.json`] = `${oldVer};${newVer}`
        }
    }

    const pluralSuffix = Object.keys(bumpedManifests).length > 1 ? 's' : ''
    if (Object.keys(bumpedManifests).length === 0) {
        bump.log.info('Completed. No manifests bumped.')
        process.exit(0)
    } else
        bump.log.success(`${Object.keys(bumpedManifests).length} manifest${pluralSuffix} bumped!`)

    // Git commit/push
    if (!script.modes.noCommit) {
        bump.log.working(`\nCommitting bump${pluralSuffix} to Git...\n`)

        // Init commit msg
        let commitMsg = 'Bumped `version`' ; const uniqueVers = {}
        Object.values(bumpedManifests).forEach(vers => {
            const newVer = vers.split(';')[1] ; uniqueVers[newVer] = true })
        if (Object.keys(uniqueVers).length === 1)
            commitMsg += ` to \`${Object.keys(uniqueVers)[0]}\``

        try { // git add/commit/push
            execSync('git add ./**/manifest.json')
            bump.initKudoSyncBot()
            spawnSync('git', ['commit', '-n', '-m', commitMsg], { stdio: 'inherit', encoding: 'utf-8' })
            console.log('')
            if (!script.modes.noPush) {
                bump.log.working('\nPulling latest changes from remote to sync local repository...\n')
                execSync('git pull')
                bump.log.working(`\nPushing bump${pluralSuffix} to Git...\n`)
                execSync('git push')
            }
            bump.log.success(`Success! ${Object.keys(bumpedManifests).length} manifest${pluralSuffix} updated${
                !script.modes.noCommit ? '/committed' : '' }${ !script.modes.noPush ? '/pushed' : '' } to GitHub`)
        } catch (err) {
            bump.log.error('Git operation failed: ' + err.message) }
    }

    console.log('')
    Object.entries(bumpedManifests).forEach(([manifest, versions]) => {
        const [oldVer, newVer] = versions.split(';')
        console.log(`  ± ${manifest} ${
            bump.colors.bw}v${oldVer}${bump.colors.nc} → ${bump.colors.bg}v${newVer}${bump.colors.nc}`)
    })
}

if (require.main == module) run()

module.exports = { run }
