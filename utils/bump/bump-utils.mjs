#!/usr/bin/env node

// bump-utils.mjs for finding/bumping/hashing etc.
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/utils/bump/bump-utils.mjs
// Latest miniified release: https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@latest/utils/bump/bump-utils.min.mjs

import fs from 'fs' // to read/write files
import ssri from 'ssri' // to generate SHA-256 hashes
import path from 'path' // to manipulate paths
import { fileURLToPath } from 'url' // to init monorepo root

const colors = {
    nc: '\x1b[0m',        // no color
    dg: '\x1b[38;5;243m', // dim gray
    bw: '\x1b[1;97m',     // bright white
    by: '\x1b[1;33m',     // bright yellow
    bg: '\x1b[1;92m',     // bright green
    br: '\x1b[1;91m'      // bright red
}
const { nc, dg, bw, by, bg, br } = colors
const lvlColors = { hash: dg, info: bw, working: by, success: bg, error: br }
const log = {} ; Object.keys(lvlColors).forEach(lvl => log[lvl] = function(msg) {
    const formattedMsg = lvlColors[lvl] +( log.endedWithLineBreak ? msg.trimStart() : msg ) + nc
    console.log(formattedMsg) ; log.endedWithLineBreak = msg.toString().endsWith('\n')
})

export { colors, log }

export function bumpDateVer(filePath) { // bumps YYYY.M.D versions
    const fileContent = fs.readFileSync(filePath, 'utf-8'),
          oldVer = fileContent.match(/(?:@version|"version"):?\s*"?([\d.]+)"?/)?.[1]
    if (!oldVer) return
    const date = new Date(), today = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}` ; let newVer
    if (oldVer == today) // bump sub-ver to 1
        newVer = `${today}.1`
    else if (oldVer.indexOf(`${today}.`) == 0) // bump sub-ver to 2+
        newVer = `${today}.${parseInt(oldVer.split('.').pop()) + 1}`
    else // bump to today
        newVer = today
    fs.writeFileSync(filePath, fileContent.replace(new RegExp(`("?)${oldVer}("?)`), `$1${newVer}$2`), 'utf-8')
    this.log.success(`${nc}Updated: ${bw}v${oldVer}${nc} → ${bg}v${newVer}${nc}`)
    return { oldVer, newVer }
}

export async function findUserJS(dir = global.monorepoRoot) {
    const userJSfiles = []
    if (!dir && !global.monorepoRoot) { // no arg passed, init monorepo root
        dir = path.dirname(fileURLToPath(import.meta.url))
        while (!fs.existsSync(path.join(dir, 'package.json')))
            dir = path.dirname(dir) // traverse up to closest manifest dir
        global.monorepoRoot = dir
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

export function findExtensionManifests(dir = global.monorepoRoot) {
    const manifestFiles = []
    if (!dir && !global.monorepoRoot) {
        dir = path.dirname(fileURLToPath(import.meta.url))
        while (!fs.existsSync(path.join(dir, 'package.json')))
            dir = path.dirname(dir)
        global.monorepoRoot = dir
    }
    dir = path.resolve(dir)
    ;(function search(currentDir) {
        fs.readdirSync(currentDir).forEach(entry => {
            if (/^(?:\.|node_modules$)/.test(entry)) return
            const entryPath = path.join(currentDir, entry)
            if (fs.statSync(entryPath).isDirectory()) search(entryPath)
            else if (entry == 'manifest.json') { console.log(entryPath) ; manifestFiles.push(entryPath) }
        })
    })(dir)
    return manifestFiles
}

export async function generateSRIhash(resURL, algorithm = 'sha256') {
    const sriHash = ssri.fromData(
        Buffer.from(await (await fetch(resURL)).arrayBuffer()), { algorithms: [algorithm] }).toString()
    this.log.hash(`${sriHash}\n`)
    return sriHash
}

export async function getLatestCommitHash(repo, path) {
    const endpoint = `https://api.github.com/repos/${repo}/commits`,
          latestCommitHash = (await (await fetch(`${endpoint}?path=${ path || '' }`)).json())[0]?.sha
    if (latestCommitHash) this.log.hash(`${latestCommitHash}\n`)
    return latestCommitHash
}

export async function isValidResource(resURL) {
    try {
        const resIsValid = !(await (await fetch(resURL)).text()).startsWith('Package size exceeded')
        if (!resIsValid) this.log.error(`\nInvalid resource: ${resURL}\n`)
        return resIsValid
    } catch (err) { return this.log.error(`\nCannot validate resource: ${resURL}\n`) }
}
