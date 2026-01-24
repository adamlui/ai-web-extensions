#!/usr/bin/env node

// Bumps @require'd JS in userscripts

// NOTE: Doesn't git commit to allow script editing from breaking changes
// NOTE: Pass --cache to use cachePaths.userJSpaths for faster init
// NOTE: Pass --dev to not use cachePaths.bumpUtils for latest ver

(async () => {
    'use strict'

    // Parse ARGS
    const args = process.argv.slice(2)
    const config = {
        cacheMode: args.some(arg => arg.startsWith('--cache')),
        devMode:  args.some(arg => arg.startsWith('--dev'))
    }

    // Import LIBS
    const fs = require('fs'), // to read/write files
          path = require('path') // to manipulate paths

    // Init CACHE paths
    const cachePaths = { root: '.cache/' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}bump-utils.min.mjs`)
    cachePaths.userJSpaths = path.join(__dirname, `${cachePaths.root}userscript-paths.json`)

    // Import BUMP UTILS
    let bump
    if (app.config.devMode) // bypass cache for latest bump-utils.mjs
        bump = await import('./bump-utils.mjs')
    else { // import remote bump-utils.min.mjs updated every ~12h
        fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
        fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
            'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs')).text()))
        bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)
    }

    // Init REGEX
    const regEx = {
        hash: { commit: /(@|\?v=)([^/#]+)/, sri: /[^#]+$/ },
        resName: /[^/]+\/(?:dist)?\/?[^/]+\.js(?=[?#]|$)/,
        jsURL: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/
    }

    // Collect userscripts
    bump.log.working(`\n${ app.config.cacheMode ? 'Collecting' : 'Searching for' } userscripts...\n`)
    let userJSfiles = []
    if (app.config.cacheMode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.userJSpaths), { recursive: true })
            const fd = fs.openSync(cachePaths.userJSpaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.error(`Cache file missing. Generating ${cachePaths.userJSpaths}...\n`)
            userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(userJSfiles, undefined, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.userJSpaths}`)
        } catch (err) { // use existing cache file
            userJSfiles = JSON.parse(fs.readFileSync(cachePaths.userJSpaths, 'utf-8'))
            console.log(userJSfiles) ; console.log('')
        }
    } else { // use bump.findFileBySuffix()
        userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('') }

    // Collect resources
    bump.log.working('\nCollecting resources...\n')
    const urlMap = {} ; let resCnt = 0
    userJSfiles.forEach(userJSfilePath => {
        const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
              resURLs = [...userJScontent.matchAll(new RegExp(regEx.jsURL.source, 'gm'))].map(match => match[1])
        if (resURLs?.length) { urlMap[userJSfilePath] = resURLs ; resCnt += resURLs.length }
    })
    bump.log.success(`${resCnt} potentially bumpable resource(s) found.`)

    // Fetch latest commit hash for adamlui/ai-web-extensions
    bump.log.working('\nFetching latest commit hash for adamlui/ai-web-extensions...\n')
    const latestCommitHashes = { aiweb: await bump.getLatestCommitHash({ repo: 'adamlui/ai-web-extensions' })}

    // Process each userscript
    let urlsUpdatedCnt = 0 ; let filesUpdatedCnt = 0
    for (const userJSfilePath of Object.keys(urlMap)) {

        // Init repo name
        let repoName = userJSfilePath.split('\\').pop().replace('.user.js', '')
        if (repoName.endsWith('-mode')) repoName = repoName.slice(0, -5) // for chatgpt-widescreen

        bump.log.working(`\nProcessing ${repoName}...\n`)

        // Fetch latest commit hash for repo/chromium/extension
        if (urlMap[userJSfilePath].some(url => url.includes(repoName))) {
            console.log('Fetching latest commit hash for Chromium extension...')
            latestCommitHashes.chromium = await bump.getLatestCommitHash(
            { repo: `adamlui/${repoName}`, path: 'chromium/extension' })
        }

        // Process each resource
        let fileUpdated = false
        for (const resURL of urlMap[userJSfilePath]) {
            if (!await bump.isValidResource({ resURL, verbose: false })) continue // to next resource
            const resName = regEx.resName.exec(resURL)?.[0] || 'resource' // dir/filename for logs

            // Compare/update commit hash
            let resLatestCommitHash = latestCommitHashes[resURL.includes(repoName) ? 'chromium' : 'aiweb']
            if (resLatestCommitHash.startsWith( // compare hashes
                regEx.hash.commit.exec(resURL)?.[2] || '')) { // commit hash didn't change...
                    console.log(`${resName} already up-to-date!`) ; bump.log.endedWithLineBreak = false
                    continue // ...so skip resource
                }
            resLatestCommitHash = resLatestCommitHash.substring(0, 7) // abbr it
            let updatedURL = resURL.replace(regEx.hash.commit, `$1${resLatestCommitHash}`) // update hash
            if (!await bump.isValidResource({ resURL: updatedURL, verbose: false })) continue // to next resource

            // Generate/compare/update SRI hash
            console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Generating SRI (SHA-256) hash for ${resName}...`)
            const newSRIhash = await bump.generateSRIhash({ resURL: updatedURL })
            if (regEx.hash.sri.exec(resURL)?.[0] == newSRIhash) { // SRI hash didn't change
                console.log(`${resName} already up-to-date!`) ; bump.log.endedWithLineBreak = false
                continue // ...so skip resource
            }
            updatedURL = updatedURL.replace(regEx.hash.sri, newSRIhash) // update hash
            if (!await bump.isValidResource({ resURL: updatedURL, verbose: false })) continue // to next resource

            // Write updated URL to userscript
            console.log(`Writing updated URL for ${resName}...`)
            const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8')
            fs.writeFileSync(userJSfilePath, userJScontent.replace(resURL, updatedURL), 'utf-8')
            bump.log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++ ; fileUpdated = true
        }
        if (fileUpdated) {
            console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
            bump.bumpVersion({ format: 'dateVer', filePath: userJSfilePath }) ; filesUpdatedCnt++
        }
    }

    // Log final summary
    bump.log[urlsUpdatedCnt ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt ? 'Success! ' : '' }${
              urlsUpdatedCnt} resource(s) bumped across ${filesUpdatedCnt} file(s).`
    )

})()
