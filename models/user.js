const { ReturnDocument } = require('mongodb')
const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true,
    },

});

const myuser=mongoose.model("user1",userSchema);
module.exports=myuser;


