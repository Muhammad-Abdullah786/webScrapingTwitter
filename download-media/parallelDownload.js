import pLimit from 'p-limit';
import { convertToMP4 } from '../download-media/downloadVideo.js';

export async function convertAllVideos(videoURLs) {
    let cloudinaryVideos = []
    const limit = pLimit(5); //! Limit to 5 
    let completed = 0
    const tasks = videoURLs.map(video =>
        limit(async () => {
            let url = await convertToMP4(video)
            cloudinaryVideos.push(url)
            completed++;
            console.log(`✅ Converted ${completed}/${videoURLs.length}`);
            return cloudinaryVideos
        })
    );

    try {
        const results = await Promise.all(tasks);
        console.log("🎉 All videos converted!");
        return cloudinaryVideos;
    } catch (err) {
        console.error("❌ Error in conversion:", err);
    }

    return results
}