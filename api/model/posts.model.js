const mongoose = require('mongoose');

postSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    user_id: {
        type: String,
        required:true
    },
    description: {
        type: String,
        max: 500
    },
    media:
    {
        type: String
    },
    likes: {
        type: Array,
        default: []
    },
    // ,
    tags: {
        type: Array,
        default: []
    },//tag using username as its unique
    // hashTags: { type: String },
    comments: {
        type: Array,
        default: []
    },
    publicPost:{
        type:Boolean
    }

},
    { timestamps: true }
);
module.exports = mongoose.model('post', postSchema);