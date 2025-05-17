#!/usr/bin/env node

// Bumps @require'd JS in userscript
// NOTE: Doesn't git commit to allow script editing from breaking changes

(async () => {

    // Import LIBS
    const fs = require('fs'), // to read/write files
          ssri = require('ssri') // to generate SHA-256 hashes

    // Init REPO context
    const repoName = 'amazongpt',
          userJSfilePath = `./greasemonkey/${repoName}.user.js`

    // Init UI COLORS
    const nc = '\x1b[0m',        // no color
          dg = '\x1b[38;5;243m', // dim gray
          bw = '\x1b[1;97m',     // bright white
          by = '\x1b[1;33m',     // bright yellow
          bg = '\x1b[1;92m',     // bright green
          br = '\x1b[1;91m'      // bright red

    // Init REGEX
    const regEx = {
        resName: /[^/]+\/(?:css|dist)?\/?[^/]+\.(?:css|js)(?=[?#]|$)/,
        jsURL: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/,
        commitHash: /(@|\?v=)([^/#]+)/, sriHash: /[^#]+$/
    }

    // Define FUNCTIONS

    const log = {};
    ['hash', 'info', 'working', 'success', 'error'].forEach(lvl => log[lvl] = function(msg) {
        const logColor = lvl == 'hash' ? dg : lvl == 'info' ? bw : lvl == 'working' ? by : lvl == 'success' ? bg : br,
              formattedMsg = logColor + ( log.endedWithLineBreak ? msg.trimStart() : msg ) + nc
        console.log(formattedMsg) ; log.endedWithLineBreak = msg.toString().endsWith('\n')
    })

    function fetchData(url) {
        if (typeof fetch == 'undefined') // polyfill for Node.js < v21
            return new Promise((resolve, reject) => {
                try { // to use http or https module
                    const protocol = url.match(/^([^:]+):\/\//)[1]
                    if (!/^https?$/.test(protocol)) reject(new Error('Invalid fetchData() URL.'))
                    require(protocol).get(url, resp => {
                        let rawData = ''
                        resp.on('data', chunk => rawData += chunk)
                        resp.on('end', () => resolve({ json: () => JSON.parse(rawData) }))
                    }).on('error', err => reject(new Error(err.message)))
                } catch (err) { reject(new Error('Environment not supported.'))
            }})
        else // use fetch() from Node.js v21+
            return fetch(url)
    }

    async function isValidResource(resURL) {
        try {
            const resIsValid = !(await (await fetchData(resURL)).text()).startsWith('Package size exceeded')
            if (!resIsValid) log.error(`\nInvalid resource: ${resURL}\n`)
            return resIsValid
        } catch (err) {
            log.error(`\nCannot validate resource: ${resURL}\n`)
            return null
        }
    }

    async function getLatestCommitHash(repo, path) {
        const endpoint = `https://api.github.com/repos/${repo}/commits`,
              latestCommitHash = (await (await fetchData(`${endpoint}?path=${ path || '' }`)).json())[0]?.sha
        if (latestCommitHash) log.hash(`${latestCommitHash}\n`)
        return latestCommitHash
    }

    async function generateSRIhash(resURL, algorithm = 'sha256') {
        const sriHash = ssri.fromData(
            Buffer.from(await (await fetchData(resURL)).arrayBuffer()), { algorithms: [algorithm] }).toString()
        log.hash(`${sriHash}\n`)
        return sriHash
    }

    function bumpUserJSver(userJSfilePath) {
        const date = new Date(),
              today = `${date.getFullYear()}.${date.getMonth() +1}.${date.getDate()}`, // YYYY.M.D format
              reVersion = /(@version\s+)([\d.]+)/,
              userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
              currentVer = userJScontent.match(reVersion)[2]
        let newVer
        if (currentVer.startsWith(today)) { // bump sub-ver
            const verParts = currentVer.split('.'),
                  subVer = verParts.length > 3 ? parseInt(verParts[3], 10) +1 : 1
            newVer = `${today}.${subVer}`
        } else // bump to today
            newVer = today
        fs.writeFileSync(userJSfilePath, userJScontent.replace(reVersion, `$1${newVer}`), 'utf-8')
        console.log(`Updated: ${bw}v${currentVer}${nc} → ${bg}v${newVer}${nc}`)
    }

    // Run MAIN routine

    // Collect resourcs
    log.working('\nCollecting resources...\n')
    const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
          resURLs = [...userJScontent.matchAll(new RegExp(regEx.jsURL.source, 'gm'))].map(match => match[1])
    log.success(`${resURLs.length} potentially bumpable resource(s) found.`)

    // Fetch latest commit hash for adamlui/ai-web-extensions
    log.working('\nFetching latest commit hash for adamlui/ai-web-extensions...\n')
    const latestCommitHashes = { aiweb: await getLatestCommitHash('adamlui/ai-web-extensions') }

    log.working('\nProcessing resource(s)...\n')
    let urlsUpdatedCnt = 0

    // Fetch latest commit hash for repo/chrom<e|ium>/extension
    if (resURLs.some(url => url.includes(repoName))) {
        console.log('Fetching latest commit hash for Chromium extension...')
        latestCommitHashes.chromium = await getLatestCommitHash(`adamlui/${repoName}`, 'chromium/extension')
    }

    // Process each resource
    for (const resURL of resURLs) {
        if (!await isValidResource(resURL)) continue // to next resource
        const resName = regEx.resName.exec(resURL)?.[0] || 'resource' // dir/filename for logs

        // Compare/update commit hash
        let resLatestCommitHash = latestCommitHashes[resURL.includes(repoName) ? 'chromium' : 'aiweb']
        if (resLatestCommitHash.startsWith( // compare hashes
            regEx.commitHash.exec(resURL)?.[2] || '')) { // commit hash didn't change...
                console.log(`${resName} already up-to-date!`) ; log.endedWithLineBreak = false
                continue // ...so skip resource
            }
        resLatestCommitHash = resLatestCommitHash.substring(0, 7) // abbr it
        let updatedURL = resURL.replace(regEx.commitHash, `$1${resLatestCommitHash}`) // update hash
        if (!await isValidResource(updatedURL)) continue // to next resource

        // Generate/compare/update SRI hash
        console.log(`${ !log.endedWithLineBreak ? '\n' : '' }Generating SRI (SHA-256) hash for ${resName}...`)
        const newSRIhash = await generateSRIhash(updatedURL)
        if (regEx.sriHash.exec(resURL)?.[0] == newSRIhash) { // SRI hash didn't change
            console.log(`${resName} already up-to-date!`) ; log.endedWithLineBreak = false
            continue // ...so skip resource
        }
        updatedURL = updatedURL.replace(regEx.sriHash, newSRIhash) // update hash
        if (!await isValidResource(updatedURL)) continue // to next resource

        // Write updated URL to userscript
        console.log(`Writing updated URL for ${resName}...`)
        const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8')
        fs.writeFileSync(userJSfilePath, userJScontent.replace(resURL, updatedURL), 'utf-8')
        log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++
    }
    if (urlsUpdatedCnt > 0) {
        console.log(`${ !log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
        bumpUserJSver(userJSfilePath)
    }

    // Log final summary
    log[urlsUpdatedCnt > 0 ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt > 0 ? 'Success! ' : '' }${urlsUpdatedCnt} resource(s) bumped.`)

})()
