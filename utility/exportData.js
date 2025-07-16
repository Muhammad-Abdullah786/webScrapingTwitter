import { spawn } from "child_process"
import env from "./env.js"

export async function exportData(mCollection, format) {
    return new Promise((resolve, reject) => {
        const arg = [
            '--uri', env.DATABASE,
            '--collection', mCollection,
            '--out', `output.${format}`
        ]

        if (format === 'csv') {
            arg.push('--type', 'csv', '--fields', 'title,url')
        } else if (format === 'json') {
            arg.push('--jsonArray')
        }

        const mongoExport = spawn('mongoexport', arg)

        mongoExport.stdout.on('data', (data) => {
            console.log(`the data is ${data}`)
        })

        mongoExport.stderr.on('data', (data) => {
            console.error(`the data is ${data}`)
        })

        mongoExport.on('close', (ans) => {
            if (ans === 0) {
                console.log(`exported  successfully`)
                resolve()
            } else {
                console.error(`not exported ❎  ${ans}`)
                reject()
            }

            mongoExport.on('error', (err) => {
                reject(err)
            })
        })
    })
}