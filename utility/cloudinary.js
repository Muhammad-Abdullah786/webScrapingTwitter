import { v2 as cloudinary } from 'cloudinary'
import { spawn } from 'child_process';
import env from './env.js'

cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.API_KEY,
    api_secret: env.API_SECRET,
})


// export async function uploadVideoToCloudinary(filePath, publicId) {
//     try {
//         const result = await v2.uploader.upload(filePath, {
//             resource_type: 'video',
//             public_id: publicId,
//             folder: 'twitter_videos',
//             overwrite: true,
//         });


//         // Optionally delete local file after upload
//         await fs.unlink(filePath);

//         return result.secure_url;
//     } catch (error) {
//         console.error(`❌ Cloudinary upload failed:`, error);
//         throw error;
//     }
// }


export async function uploadVideoToCloudinaryStream(inputUrl, publicId) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await cloudinary.api.resource(`twitter_videos/${publicId}.mp4`, {
                resource_type: 'video'
            })
            if (result) {
                console.log(`the video is already existing 🤫 `)
                return resolve(result.secure_url)
            }
        } catch (error) {
            if (error.http_code !== 404)
                console.error(`an error orrcred ${JSON.stringify(error, 2, 2)}`)
            // return reject(error)
        }

        const ffmpeg = spawn('ffmpeg', [
            '-i', inputUrl,
            '-f', 'mp4',
            '-c', 'copy',
            '-movflags', 'frag_keyframe+empty_moov', // helps Cloudinary process it
            '-loglevel', 'quiet',
            '-'
        ]);

        const cloudStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                public_id: `twitter_videos/${publicId}`,
                overwrite: true,
                folder: 'twitter_videos'
            },
            (error, result) => {
                if (error) {
                    console.error(`❌ Cloudinary upload failed:`, error);
                    return reject(error);
                }
                console.log(`✅ Cloudinary upload success:`, result.secure_url);
                resolve(result.secure_url);
            }
        );

        ffmpeg.stdout.pipe(cloudStream);

        ffmpeg.stderr.on('data', (data) => {
            console.error(`⚠️ FFmpeg stderr: ${data}`);
        });

        ffmpeg.on('error', (err) => {
            console.error('❌ FFmpeg process error:', err);
            reject(err);
        });

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`FFmpeg exited with code ${code}`));
            }
        });
    });
}