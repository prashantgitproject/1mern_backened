const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    messages:[
        {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})



//we are hashing the password

//to use 'this' we avoid fat arrow function
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12)
        this.cpassword = await bcrypt.hash(this.cpassword, 12)
    }
    next();

})

//Generating auth token
userSchema.methods.generateAuthToken = async function(){
    try {
        let token = jwt.sign({_id: this.id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token})
        await this.save();
        return token;
    } catch (err) {
        console.log(err)
    }
}

//store the message
userSchema.methods.addMessage = async function(name, email, phone, message){
try {
   this.messages = this.messages.concat({name, email, phone, message})
   await this.save();
   return this.messages; 
} catch (error) {
    console.log(error)
}
}


// collection creation
const User = mongoose.model("USER", userSchema)

module.exports = User;