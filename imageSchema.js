import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    url: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
