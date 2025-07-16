import pLimit from 'p-limit';
import { convertToMP4 } from '../download-media/downloadVideo.js';

export async function convertAllVideos(videoURLs, cloudinaryVideos) {
    const limit = pLimit(10); //! Limit to 10
    let completed = 0
    const tasks = videoURLs.map(video =>
        limit(async () => {
            let alreadyDone = cloudinaryVideos.find((url) =>
                url.includes(`/twitter_videos/${video.baseId}.mp4`)
            )
            if (alreadyDone) return;
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