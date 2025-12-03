const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Likes:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

const postModel = mongoose.model('Post', postSchema);


module.exports = postModel;