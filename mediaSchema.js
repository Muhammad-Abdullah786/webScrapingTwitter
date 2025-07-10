import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    from: { type: String, required: true },
    url: { type: String, required: true },
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true

    },
    tweet: { type: String, required: true },
    time: { type: Date, required: true },
    savedAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
