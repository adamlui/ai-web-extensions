#!/usr/bin/env node

// Bumps @require'd JS in userscripts

// NOTE: Doesn't git commit to allow script editing from breaking changes
// NOTE: Pass --cache to use cache.filePath for faster init

(async () => {

    // Import LIBS
    const fs = require('fs'), // to read/write files
          path = require('path'), // to manipulate paths
          ssri = require('ssri') // to generate SHA-256 hashes

    // Init CACHE vars
    const cache = { mode: process.argv.includes('--cache'), filePath: path.join(__dirname, '.cache/userJSpaths.json') }

    // Init UI COLORS
    const nc = '\x1b[0m',        // no color
          dg = '\x1b[38;5;243m', // dim gray
          bw = '\x1b[1;97m',     // bright white
          by = '\x1b[1;33m',     // bright yellow
          bg = '\x1b[1;92m',     // bright green
          br = '\x1b[1;91m'      // bright red

    // Init REGEX
    const regEx = {
        hash: { commit: /(@|\?v=)([^/#]+)/, sri: /[^#]+$/ },
        resName: /[^/]+\/(?:dist)?\/?[^/]+\.js(?=[?#]|$)/,
        jsURL: /^\/\/ @require\s+(https:\/\/cdn\.jsdelivr\.net\/gh\/.+)$/
    }

    // Define FUNCTIONS

    const log = {}
    ;['hash', 'info', 'working', 'success', 'error'].forEach(lvl => log[lvl] = function(msg) {
        const logColor = lvl == 'hash' ? dg : lvl == 'info' ? bw : lvl == 'working' ? by : lvl == 'success' ? bg : br,
              formattedMsg = logColor + ( log.endedWithLineBreak ? msg.trimStart() : msg ) + nc
        console.log(formattedMsg) ; log.endedWithLineBreak = msg.toString().endsWith('\n')
    })

    async function findUserJS(dir = findUserJS.monorepoRoot) {
        const userJSfiles = []
        if (!dir && !findUserJS.monorepoRoot) { // no arg passed, init monorepo root
            dir = __dirname
            while (!fs.existsSync(path.join(dir, 'package.json')))
                dir = path.dirname(dir) // traverse up to closest manifest dir
            findUserJS.monorepoRoot = dir
        }
        dir = path.resolve(dir)
        fs.readdirSync(dir).forEach(async entry => {
            if (/^(?:\.|node_modules$)/.test(entry)) return
            const entryPath = path.join(dir, entry)
            if (fs.statSync(entryPath).isDirectory()) // recursively search subdirs
                userJSfiles.push(...await findUserJS(entryPath))
            else if (entry.endsWith('.user.js')) {
                console.log(entryPath) ; userJSfiles.push(entryPath) }
        })
        return userJSfiles
    }

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
        } catch (err) { return log.error(`\nCannot validate resource: ${resURL}\n`) }
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

    // Collect userscripts
    log.working(`\n${ cache.mode ? 'Collecting' : 'Searching for' } userscripts...\n`)
    let userJSfiles = []
    if (cache.mode) {
        try { // create missing cache file
            fs.mkdirSync(path.dirname(cache.filePath), { recursive: true })
            const fd = fs.openSync(cache.filePath, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR)
            log.error(`Cache file missing. Generating ${cache.filePath}...\n`)
            userJSfiles = await findUserJS() ; console.log('')
            fs.writeFileSync(fd, JSON.stringify(userJSfiles, null, 2), 'utf-8')
            log.success(`\nCache file created @ ${cache.filePath}`)
        } catch (err) { // use existing cache file
            userJSfiles = JSON.parse(fs.readFileSync(cache.filePath, 'utf-8'))
            console.log(userJSfiles) ; console.log('')
        }
    } else { // use findUserJS()
        userJSfiles = await findUserJS() ; console.log('') }

    // Collect resources
    log.working('\nCollecting resources...\n')
    const urlMap = {} ; let resCnt = 0
    userJSfiles.forEach(userJSfilePath => {
        const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8'),
              resURLs = [...userJScontent.matchAll(new RegExp(regEx.jsURL.source, 'gm'))].map(match => match[1])
        if (resURLs.length > 0) { urlMap[userJSfilePath] = resURLs ; resCnt += resURLs.length }
    })
    log.success(`${resCnt} potentially bumpable resource(s) found.`)

    // Fetch latest commit hash for adamlui/ai-web-extensions
    log.working('\nFetching latest commit hash for adamlui/ai-web-extensions...\n')
    const latestCommitHashes = { aiweb: await getLatestCommitHash('adamlui/ai-web-extensions') }

    // Process each userscript
    let urlsUpdatedCnt = 0 ; let filesUpdatedCnt = 0
    for (const userJSfilePath of Object.keys(urlMap)) {

        // Init repo name
        let repoName = userJSfilePath.split('\\').pop().replace('.user.js', '')
        if (repoName.endsWith('-mode')) repoName = repoName.slice(0, -5) // for chatgpt-widescreen

        log.working(`\nProcessing ${repoName}...\n`)

        // Fetch latest commit hash for repo/chromium/extension
        if (urlMap[userJSfilePath].some(url => url.includes(repoName))) {
            console.log('Fetching latest commit hash for Chromium extension...')
            latestCommitHashes.chromium = await getLatestCommitHash(`adamlui/${repoName}`, 'chromium/extension')
        }

        // Process each resource
        let fileUpdated = false
        for (const resURL of urlMap[userJSfilePath]) {
            if (!await isValidResource(resURL)) continue // to next resource
            const resName = regEx.resName.exec(resURL)?.[0] || 'resource' // dir/filename for logs

            // Compare/update commit hash
            let resLatestCommitHash = latestCommitHashes[resURL.includes(repoName) ? 'chromium' : 'aiweb']
            if (resLatestCommitHash.startsWith( // compare hashes
                regEx.hash.commit.exec(resURL)?.[2] || '')) { // commit hash didn't change...
                    console.log(`${resName} already up-to-date!`) ; log.endedWithLineBreak = false
                    continue // ...so skip resource
                }
            resLatestCommitHash = resLatestCommitHash.substring(0, 7) // abbr it
            let updatedURL = resURL.replace(regEx.hash.commit, `$1${resLatestCommitHash}`) // update hash
            if (!await isValidResource(updatedURL)) continue // to next resource

            // Generate/compare/update SRI hash
            console.log(`${ !log.endedWithLineBreak ? '\n' : '' }Generating SRI (SHA-256) hash for ${resName}...`)
            const newSRIhash = await generateSRIhash(updatedURL)
            if (regEx.hash.sri.exec(resURL)?.[0] == newSRIhash) { // SRI hash didn't change
                console.log(`${resName} already up-to-date!`) ; log.endedWithLineBreak = false
                continue // ...so skip resource
            }
            updatedURL = updatedURL.replace(regEx.hash.sri, newSRIhash) // update hash
            if (!await isValidResource(updatedURL)) continue // to next resource

            // Write updated URL to userscript
            console.log(`Writing updated URL for ${resName}...`)
            const userJScontent = fs.readFileSync(userJSfilePath, 'utf-8')
            fs.writeFileSync(userJSfilePath, userJScontent.replace(resURL, updatedURL), 'utf-8')
            log.success(`${resName} bumped!\n`) ; urlsUpdatedCnt++ ; fileUpdated = true
        }
        if (fileUpdated) {
            console.log(`${ !log.endedWithLineBreak ? '\n' : '' }Bumping userscript version...`)
            bumpUserJSver(userJSfilePath) ; filesUpdatedCnt++
        }
    }

    // Log final summary
    log[urlsUpdatedCnt > 0 ? 'success' : 'info'](
        `\n${ urlsUpdatedCnt > 0 ? 'Success! ' : '' }${
              urlsUpdatedCnt} resource(s) bumped across ${filesUpdatedCnt} file(s).`
    )

})()
