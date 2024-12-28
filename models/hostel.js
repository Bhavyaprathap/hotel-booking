const mongoose=require("mongoose");
const bookingSchema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user1',
        required:true,

    },
    hostel:{
        type:String,
        required:true,
    },
    checkinDate:{
        type:Date,
        required:true,
    },
    checkoutDate:{
        type:Date,
        required:true,
    },
    guests:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    }
});
const booking=mongoose.model("booking",bookingSchema);
module.exports=booking;