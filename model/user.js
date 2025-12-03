const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    post:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    profilePicture: {
    type: String,
    default: "https://www.uiu.ac.bd/wp-content/uploads/2023/11/dummy_person.jpg", // or default URL
  }
})
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;