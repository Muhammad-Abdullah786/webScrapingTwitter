import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const mediaSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    tweet: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    media: [mediaItemSchema] 
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;