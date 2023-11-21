const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()
const authenticate = require("../middleware/authenticate")
const cookieParser = require("cookie-parser");


router.use(cookieParser());

require('../db/conn');
const User = require('../model/userSchema')

router.get("/", (req,res)=>{
    res.send("Helo world from router js")
})

// ---------------Using Promises---------------
// router.post("/register", (req,res)=>{
//    const {name, email, phone, password, cpassword} = req.body;

//    if(!name || !email || !phone || !password || !cpassword){
//     return res.status(422).json({error: "plz fill properly"})
//    }

//    User.findOne({email: email})
//    .then((userExist)=>{
//     if(userExist){
//         return res.status(422).json({error: "email already exist"})
//     }

//     const user = new User({name, email, phone, password, cpassword}) // similar to email: email, name:name left side is key which is in database right side is value which is given by user

//     user.save().then(()=>{
//         res.status(201).json({message: "user registered successfully"})
//     }).catch((err)=> res.status(500).json({error: "failed to register"}))

//    }).catch(err => {console.log(err);})
// })

// -------------Async-await---------------------
router.post("/register", async (req,res)=>{
   const {name, email, phone, password, cpassword} = req.body;

   if(!name || !email || !phone || !password || !cpassword){
    return res.status(422).json({error: "plz fill properly"})
   }

   try{

   const userExist = await User.findOne({email: email});

   if(userExist){
    return res.status(422).json({error: "email already exist"})

    }else if(password != cpassword){
        return res.status(422).json({error: "password is not matching"}) 

    }else{
        const user = new User({name, email, phone, password, cpassword})

        await user.save()
    
        res.status(201).json({message: "user registered successfully"})
    }

   


   }catch(err){
    console.log(err);
   }

})

//login route

router.post("/signin", async (req,res)=>{
    try {
        let token
        const {email, password} = req.body

        if(!email || !password){
           return res.status(400).json({error: "plz fill the data"})
        }

        const userLogin = await User.findOne({email: email})
        // console.log(userLogin);

        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password)

            token = await userLogin.generateAuthToken()
            console.log(token)

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            })

            if(!isMatch){
                res.status(400).json({error: "Invalid credentials"})
            }else{
                res.json({message: "user signin successfully"})
        }
        }else{
            res.status(400).json({error: "Invalid credentials"})
        }
        
    } catch (err) {
        console.log(err)
    }
})

// About us page after authentication
router.get("/about", authenticate, (req,res)=>{
    console.log("hello my about")
    res.send(req.rootUser)
});
//Get user data for contact and home page
router.get("/getdata", authenticate, (req,res)=>{
    res.send(req.rootUser);
})
// Contact us page
router.post("/contact", authenticate , async (req,res)=>{
    try {
        const {name, email, phone, message} = req.body;

        if(!name || !email || !phone || !message){
            console.log("data not filled");
            return res.json({error: "plz fill the contact form"})
        }

        const userContact = await User.findOne({_id: req.userID})

        if(userContact){
            const userMessage = await userContact.addMessage(name, email, phone, message)
            await userContact.save();
            res.status(201).json({message: "user contact successfully"})
        }
    } catch (error) {
        console.log(error)
    }
});

// Logout page
router.get("/logout", (req,res)=>{
    console.log("hello my logout")
    res.clearCookie('jwtoken', {path:'/'});
    res.status(200).send("user Logout")
});

module.exports = router;