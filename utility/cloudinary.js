import { v2 as cloudinary, v2 } from 'cloudinary'
import env from './env.js'
import fs from 'fs/promises'

cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.API_KEY,
    api_secret: env.API_SECRET,
})


export async function uploadVideoToCloudinary(filePath, publicId) {
    try {
        const result = await v2.uploader.upload(filePath, {
            resource_type: 'video',
            public_id: publicId,
            folder: 'twitter_videos',
            overwrite: true,
        });


        // Optionally delete local file after upload
        await fs.unlink(filePath);

        return result.secure_url;
    } catch (error) {
        console.error(`❌ Cloudinary upload failed:`, error);
        throw error;
    }
}