#!/usr/bin/env node

// bump-utils.js

const fs = require('fs'), // to read/write files
      path = require('path'), // to manipulate paths
      ssri = require('ssri') // to generate SHA-256 hashes

const colors = {
    nc: '\x1b[0m',        // no color
    dg: '\x1b[38;5;243m', // dim gray
    bw: '\x1b[1;97m',     // bright white
    by: '\x1b[1;33m',     // bright yellow
    bg: '\x1b[1;92m',     // bright green
    br: '\x1b[1;91m'      // bright red
}

module.exports = {

    log: (function() {
        const log = {}
        ;['hash', 'info', 'working', 'success', 'error'].forEach(lvl => log[lvl] = function(msg) {
            const logColor = (
                lvl == 'hash' ? colors.dg : lvl == 'info' ? colors.bw : lvl == 'working' ? colors.by : lvl == 'success' ? colors.bg : colors.br )
            const formattedMsg = logColor + ( log.endedWithLineBreak ? msg.trimStart() : msg ) + colors.nc
            console.log(formattedMsg) ; log.endedWithLineBreak = msg.toString().endsWith('\n')
        })
        return log
    })(),

    bumpUserJSver(userJSfilePath) {
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
        console.log(`Updated: ${colors.bw}v${currentVer}${colors.nc} → ${colors.bg}v${newVer}${colors.nc}`)
    },

    fetchData(url) {
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
    },

    async findUserJS(dir = this.findUserJS.monorepoRoot) {
        const userJSfiles = []
        if (!dir && !this.findUserJS.monorepoRoot) { // no arg passed, init monorepo root
            dir = __dirname
            while (!fs.existsSync(path.join(dir, 'package.json')))
                dir = path.dirname(dir) // traverse up to closest manifest dir
            this.findUserJS.monorepoRoot = dir
        }
        dir = path.resolve(dir)
        fs.readdirSync(dir).forEach(async entry => {
            if (/^(?:\.|node_modules$)/.test(entry)) return
            const entryPath = path.join(dir, entry)
            if (fs.statSync(entryPath).isDirectory()) // recursively search subdirs
                userJSfiles.push(...await this.findUserJS(entryPath))
            else if (entry.endsWith('.user.js')) {
                console.log(entryPath) ; userJSfiles.push(entryPath) }
        })
        return userJSfiles
    },

    async getLatestCommitHash(repo, path) {
        const endpoint = `https://api.github.com/repos/${repo}/commits`,
              latestCommitHash = (await (await this.fetchData(`${endpoint}?path=${ path || '' }`)).json())[0]?.sha
        if (latestCommitHash) this.log.hash(`${latestCommitHash}\n`)
        return latestCommitHash
    },

    async generateSRIhash(resURL, algorithm = 'sha256') {
        const sriHash = ssri.fromData(
            Buffer.from(await (await this.fetchData(resURL)).arrayBuffer()), { algorithms: [algorithm] }).toString()
        this.log.hash(`${sriHash}\n`)
        return sriHash
    },

    async isValidResource(resURL) {
        try {
            const resIsValid = !(await (await this.fetchData(resURL)).text()).startsWith('Package size exceeded')
            if (!resIsValid) this.log.error(`\nInvalid resource: ${resURL}\n`)
            return resIsValid
        } catch (err) { return this.log.error(`\nCannot validate resource: ${resURL}\n`) }
    }
};
