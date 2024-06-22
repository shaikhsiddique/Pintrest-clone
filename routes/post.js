const mongoose=require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/pintrest");

const userschema=mongoose.Schema({
    
  postText: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
    default: 0,
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  }
  
});

module.exports=(mongoose.model("post",userschema));


