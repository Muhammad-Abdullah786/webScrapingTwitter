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

const cloudinaryCache = new Map();

export async function getAllVideos() {

    let allVideoData = [];
    let nextCursor = null;


    try {
        do {
            const result = await cloudinary.api.resources({
                resource_type: 'video',
                type: 'upload',
                prefix: 'twitter_videos/',
                max_results: 500,
                next_cursor: nextCursor,
            });

            const videoData = result.resources.map(resource => ({
                name: resource.public_id.replace('twitter_videos/', ''),
                url: resource.secure_url
            }));

            allVideoData = allVideoData.concat(videoData);
            nextCursor = result.next_cursor;

            console.log(`✅ Fetched batch: ${videoData.length} videos, total: ${allVideoData.length}`);
        } while (nextCursor);

        allVideoData.forEach((video) => {
            cloudinaryCache.set(video.name, video.url);
        })
        return cloudinaryCache;
    } catch (error) {
        console.error('Error fetching video URLs:', error);
        throw error;
    }
}




export async function uploadVideoToCloudinaryStream(inputUrl, publicId) {
    return new Promise(async (resolve, reject) => {
        const cacheKey = `twitter_videos/${publicId}`;

        try {
            if (cloudinaryCache.has(cacheKey)) {
                const cachedUrl = cloudinaryCache.get(cacheKey);
                console.log(`✅ Video cache hit for ${publicId}: ${cachedUrl}`);
                return resolve(cachedUrl);
            }

        } catch (error) {
            if (error.http_code !== 404) {
                return reject(error);
            }
            // 404 means the file doesn’t exist, proceed with upload
        }

        const ffmpeg = spawn('ffmpeg', [
            '-i', inputUrl,
            '-f', 'mp4',
            '-c', 'copy',
            '-movflags', 'frag_keyframe+empty_moov',
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
                cloudinaryCache.set(cacheKey, result.secure_url); // Cache the result
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

