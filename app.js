const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express');
const app = express();

dotenv.config({path: './config.env'})
require('./db/conn')

//To make application understand the json data that we have given with the help of middleware. It coverts json into object.
app.use(express.json())

//Linking router files to make route easy
app.use(require('./router/auth'))

//free host
const PORT = process.env.PORT;



// app.get("/about", middleware, (req,res)=>{
//     res.send("About us")
// });
// app.get("/contact", (req,res)=>{
//     res.send("Contact us")
// });
app.get("/signin", (req,res)=>{
    res.send("Hello world from the server")
});
app.get("/signup", (req,res)=>{
    res.send("Hello world from the server")
});


app.listen(PORT, ()=>{
    console.log(`Server is running at port no. ${PORT}`)
})