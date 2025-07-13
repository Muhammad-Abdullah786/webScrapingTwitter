import { exec } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


export async function convertToMP4(stream ) {
    console.log(`the stream comming to convert is ${stream.master}`)
    const outFile = path.join(__dirname, 'downloads', `${stream.baseId}.mp4`);

    if (stream.master) {
        console.log(`🎞️ Using master playlist... `);
        await runFFmpeg(`ffmpeg -y -i "${stream.master}" -c copy "${outFile}"`);
    } else if (stream.video && stream.audio) {
        console.log(`🎞️ Merging separate video and audio...`);
        await runFFmpeg(`ffmpeg -y -i "${stream.video}" -i "${stream.audio}" -c copy "${outFile}"`);
    } else {
        console.warn(`⚠️ Missing audio or video for ${stream.baseId}, skipping...`);
        return null;
    }

    return outFile;
}

function runFFmpeg(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ FFmpeg error:`, stderr || stdout);
                return reject(error);
            }
            console.log(`✅ Conversion done.`);
            resolve();
        });
    });
}
