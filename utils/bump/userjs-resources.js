#!/usr/bin/env node

// Bumps @require'd JS resources in userscripts (commit‑based + npm‑based)

// NOTE: Doesn't git commit to allow script editing from breaking changes
// NOTE: Pass --cache to use cachePaths.userJSpaths for faster init

(async () => {
    'use strict'

    // Parse ARGS
    const args = process.argv.slice(2),
          config = { cacheMode: args.some(arg => arg.startsWith('--cache')) }

    // Import LIBS
    const fs = require('fs'),
          path = require('path')

    // Init CACHE paths
    const cachePaths = { root: '.cache' }
    cachePaths.bumpUtils = path.join(__dirname, `${cachePaths.root}/bump.min.mjs`)
    cachePaths.userJSpaths = path.join(__dirname, `${cachePaths.root}/userscript-paths.json`)

    // Import BUMP UTILS
    fs.mkdirSync(path.dirname(cachePaths.bumpUtils), { recursive: true })
    fs.writeFileSync(cachePaths.bumpUtils, (await (await fetch(
        'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@f63b650/utils/bump/lib/bump.min.mjs')).text()))
    const bump = await import(`file://${cachePaths.bumpUtils}`) ; fs.unlinkSync(cachePaths.bumpUtils)

    // Init REGEX
    const regEx = {
        cjsURL: /(https:\/\/cdn\.jsdelivr\.net\/npm\/@kudoai\/chatgpt\.js@)([\d.]+)(\/dist\/chatgpt\.min\.js)(#sha256-\S+)?/g,
        hash: { commit: /(@|\?v=)([^/#]+)/, sri: /[^#]+$/ },
        resName: /[^/]+\/(?:dist)?\/?[^/]+\.js(?=[?#]|$)/,
        jsURL_gh: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/
    }

    // Collect userscripts
    bump.log.working(`\n${ config.cacheMode ? 'Collecting' : 'Searching for' } userscripts...\n`)
    let userJSfiles
    if (config.cacheMode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cachePaths.userJSpaths), { recursive: true })
            const fd = fs.openSync(cachePaths.userJSpaths,
                fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            bump.log.info(`Cache file missing. Generating ${cachePaths.userJSpaths}...\n`)
            userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(userJSfiles, undefined, 2), 'utf-8')
            bump.log.success(`\nCache file created @ ${cachePaths.userJSpaths}`)
        } catch (err) { // use existing cache file
            userJSfiles = JSON.parse(fs.readFileSync(cachePaths.userJSpaths, 'utf-8'))
            console.log(userJSfiles) ; console.log('')
        }
    } else
        userJSfiles = await bump.findFileBySuffix({ suffix: '.user.js' }) ; console.log('')

    // Collect GH resources
    bump.log.working('\nCollecting GH resources...\n')
    const urlMap = {} ; let ghResCnt = 0
    userJSfiles.forEach(userJSfilePath => {
        const content = fs.readFileSync(userJSfilePath, 'utf-8'),
              resURLs = [...content.matchAll(new RegExp(regEx.jsURL_gh.source, 'gm'))].map(match => match[1])
        if (resURLs?.length) { urlMap[userJSfilePath] = resURLs ; ghResCnt += resURLs.length }
    })
    bump.log.success(`${ghResCnt} potentially bumpable GH resource(s) found.`)

    // Fetch latest commit hashes
    bump.log.working('\nFetching latest commit hashes...\n')
    const latestCommitHashes = {
        aiweb: await bump.getLatestCommitHash({ repo: 'adamlui/ai-web-extensions' }),
        userscripts: await bump.getLatestCommitHash({ repo: 'adamlui/userscripts' })
    }

    // Process GH resources
    let urlsUpdatedCnt = 0, filesUpdatedCnt = 0
    for (const userJSfilePath of Object.keys(urlMap)) {
        const repoName = userJSfilePath.split('\\').pop().replace('.user.js', '')
        bump.log.working(`\nProcessing GH resources in ${repoName}...\n`)

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
            let resLatestCommitHash = latestCommitHashes[
                resURL.includes('/ai-web-extensions@') ? 'aiweb'
              : resURL.includes('/userscripts@') ? 'userscripts'
              : 'chromium'
            ]
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
            const content = fs.readFileSync(userJSfilePath, 'utf-8')
            fs.writeFileSync(userJSfilePath, content.replace(resURL, updatedURL), 'utf-8')
            bump.log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++ ; fileUpdated = true
        }
        if (fileUpdated) {
            console.log(`${ !bump.log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
            bump.bumpVersion({ format: 'dateVer', filePath: userJSfilePath }) ; filesUpdatedCnt++
        }
    }

    // Process chatgpt.js
    bump.log.working('\nProcessing @kudoai/chatgpt.js @require URLs...\n')
    const latestCJSver = (await (await fetch('https://registry.npmjs.org/@kudoai/chatgpt.js/latest')).json()).version
    bump.log.info(`Latest @kudoai/chatgpt.js version: ${latestCJSver}\n`)
    for (const userJSfilePath of userJSfiles) {
        let fileChanged = false
        const content = fs.readFileSync(userJSfilePath, 'utf-8')
        const matches = [...content.matchAll(regEx.cjsURL)]

        for (const match of matches) {
            const oldFullURL = match[0], oldVer = match[2]
            if (oldVer == latestCJSver) {
                console.log(`${path.basename(userJSfilePath)} already at v${latestCJSver}`)
                continue
            }

            // Build new URL w/o SRI
            const baseNewURL = `${match[1]}${latestCJSver}${match[3]}`
            bump.log.working(`\nGenerating SRI for v${latestCJSver}...\n`)
            const sriHash = await bump.generateSRIhash({ resURL: baseNewURL, verbose: false }),
                  newFullURL = `${baseNewURL}#${sriHash}`

            // Replace just the URL in fresh-read content
            const freshContent = fs.readFileSync(userJSfilePath, 'utf-8')
            fs.writeFileSync(userJSfilePath, freshContent.replace(oldFullURL, newFullURL), 'utf-8')
            bump.log.success(`Updated @require in ${path.basename(userJSfilePath)}`)
            fileChanged = true ; urlsUpdatedCnt++
        }

        if (fileChanged) {
            bump.log.working('Bumping userscript version...\n')
            bump.bumpVersion({ format: 'dateVer', filePath: userJSfilePath })
            filesUpdatedCnt++
        }
    }

    // Final summary
    bump.log[urlsUpdatedCnt ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt ? 'Success! ' : '' }${
              urlsUpdatedCnt} resource(s) bumped across ${filesUpdatedCnt} file(s).`
    )
})()
