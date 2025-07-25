import { uploadVideoToCloudinaryStream } from '../utility/cloudinary.js'

// const __dirname = dirname(fileURLToPath(import.meta.url));


// export async function convertToMP4(stream) {
//     console.log(`the stream comming to convert is ${stream.master}`)
//     const outFile = path.join(__dirname, 'downloads', `${stream.baseId}.mp4`);
//     try {
//         if (stream.master) {
//             console.log(`🎞️ Using master playlist... `);
//             await runFFmpeg(`ffmpeg -y -i "${stream.master}" -c copy "${outFile}"`);
//         } else if (stream.video && stream.audio) {
//             console.log(`🎞️ Merging separate video and audio...`);
//             await runFFmpeg(`ffmpeg -y -i "${stream.video}" -i "${stream.audio}" -c copy "${outFile}"`);
//         } else {
//             console.warn(`⚠️ Missing audio or video for ${stream.baseId}, skipping...`);
//             return null;
//         }

//         const cloudinaryFile = await uploadVideoToCloudinaryStream(outFile, stream.baseId)
//         console.log(`the video uploaded to cloud  ${cloudinaryFile}`)

//         return cloudinaryFile;
//     } catch (error) {
//         console.error(`an error occure in convertor fn ${error}`)
//         return null
//     }


// }

// function runFFmpeg(cmd) {
//     return new Promise((resolve, reject) => {
//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`❌ FFmpeg error:`, stderr || stdout);
//                 return reject(error);
//             }
//             console.log(`✅ Conversion done.`);
//             resolve();
//         });
//     });
// }



export async function convertToMP4(stream) {
    console.time(`Conversion for ${stream.baseId}`);
    try {
        const sourceUrl = stream.master || stream.video;
        if (!sourceUrl) {
            console.warn(`⚠️ No video stream found for baseId: ${stream.baseId}`);
            return null;
        }

        console.log(`🎞️ Converting and uploading video for ${stream.baseId}...`);
        const cloudinaryFile = await uploadVideoToCloudinaryStream(sourceUrl, stream.baseId);
        console.log(`✅ Uploaded to Cloudinary: ${cloudinaryFile}`);

        console.timeEnd(`Conversion for ${stream.baseId}`);
        return cloudinaryFile;
    } catch (error) {
        console.error(`❌ Error during conversion/upload: ${JSON.stringify(error.error.message, 2, 2)}`);
        console.timeEnd(`Conversion for ${stream.baseId}`);
        return null;
    }
}