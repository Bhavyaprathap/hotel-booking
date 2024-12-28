const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const ejs=require('ejs');
const session=require('express-session');
const {collection}=require("./models/user");
const mongodbStore=require("connect-mongodb-session")(session);
const myuser=require("./models/user");
const bcrypt=require("bcryptjs");
const booking=require("./models/hostel")

const app=express();
app.use(express.urlencoded({extended:true}));

dotenv.config();

const port=process.env.port || 8089;

app.set("view engine","ejs");
app.use(express.static("public"));

const store=new mongodbStore({
    uri:process.env.MONGO_URI,
    collection:"session3",
});
store.on("error",(error)=>{
    console.error("error: ",error);

});

app.use(
    session({
        secret:"this is  a secrete",
        resave:false,
        saveUnintialized:true,
        store:store,

    })
);

const checkAuth=((req,res,next)=>{
    if(req.session.isauth){
        next()
    }
    else{
        res.redirect("/signup")
    }
})
mongoose
        .connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("Mongodb Successfully connected");
        })
        .catch((error)=>{
            console.log(`${error}`);
        });
app.get("/login",(req,res)=>{
    console.log("Session: ",req.session);
    res.render("login");
});
app.get("/signup",(req,res)=>{
    res.render("sign");
})
app.get("/dashboard",checkAuth,async(req,res)=>{
    const user=await myuser.findById(req.session.userid);
    res.render("welcome",{user});
});
app.get('/hello',(req,res)=>{
    res.render('hello')
    res.send("Welcome to room selection page")
})
app.post('/register',async(req,res)=>{
    console.log("Request body: ",req.body);

    const {username,email,password}=req.body;

   

    if(!username || !email|| !password){
    console.error("missing required details");
    return res.redirect("/signup");
    }

    //check whether the usern exists or not

    try{
        const existinguser=await myuser.findOne({email});
        if(existinguser){
            console.log("User already exists");
            return res.redirect("/signup");
        }
        console.log("hashing password");

        const hashedpassword=await bcrypt.hash(password,12)
        console.log("password is successfully hashed!!")

        const newuser=new myuser({
            username,
            email,
            password:hashedpassword,
        });
        await newuser.save();

        console.log("user saved");
        console.log("Redirecting to login page");
        return res.redirect("/login");
    }
    catch(error){
        console.error("Error saving user ",error.message);
        return res.redirect("/signup");
    }

});

app.post("/log",async(req,res)=>{
    const {email,password}=req.body;
    const user=await myuser.findOne({email})
    if(!user){
        console.log("Password error");
        return res.redirect("/signup");
    }
    const checkpass=await bcrypt.compare(password,user.password)
    if(!checkpass){
        return res.redirect("/signup");
    }
    req.session.isauth=true
    req.session.userid=user._id;
    res.redirect("/dashboard");
})
app.post("/book-room",checkAuth,async(req,res)=>{
    const {hostel,checkinDate,checkoutDate,guests}=req.body;
    
    const pricepernight=1000;
    const night=(new Date(checkoutDate)-new Date(checkinDate))/(1000*60*60*24);
    const totalPrice=pricepernight*night;

    try{
        const roombooking=new booking({
            userid:req.session.userid,
            hostel,
            checkinDate,
            checkoutDate,
            guests,
            price:totalPrice,
        });
        await roombooking.save();
        console.log("Room booked suucessfully");
        res.render("Confirmation",{roombooking});
    }
    catch(error){
        console.error("Error booking the room",error);
       

        res.redirect("/dashboard");

        
    }
    
});
app.listen(port,()=>console.log(`server started in the port ${port}`),
console.log("Server started in http://localhost:8089/signup"));