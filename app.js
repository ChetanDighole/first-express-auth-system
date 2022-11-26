require('dotenv').config()
require("./config/database").connect()

const express = require('express');

const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")

const User = require("./model/user")

const cookieParser = require('cookie-parser')

//custom miidleware
const auth = require('./middleware/auth')


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.send("hello auth system")
})

// registration of users starts here...

app.post('/register',async (req,res)=>{
    try {
        //collect all data
        const { firstname , lastname , email , password } = req.body

        //validate
        if (!(email && password && lastname && firstname)) {
            res.status(401).send("all fields are necessary");
        }

        // check user exist or not
        const existingUser = await User.findOne({email})  //mongoose querry doc.

        if (existingUser) {
            res.status(401).send("user already exist")
        }

        //encryt password
        const myEnnyPassword = await bcrypt.hash(password,10)

        //create a entry to database
        //user (new user) =frontend  & User= database (./model/database)
        const user = await User.create({
            firstname,
            lastname,
            email,
            password : myEnnyPassword,
            
        })

        // create a token and send it to user
        const token = jwt.sign({
            id : user._id , email
        },'shhhhh',{expiresIn:'2h'})


        user.token = token;
        //don't want to send pass
        user.password = undefined

        res.status(201).json(user)



    } catch (error) {
        console.log(error);
        console.log("error is response rout");
    }
})

// login of users starts here...

app.post('/login', async (req,res) => {
    try {
        //collect info from frontend

        const { email , password } = req.body;

        //validate

        if(!(email && password)){
            res.status(401).send("email and passord required")
        }

        //check user in database
        const user = await User.findOne({email}) //findOne() method returns all the data that match the {paramete} it's not a boolean method

        //if user does not exist

        //match password
        if (user && (await bcrypt.compare(password , user.password))) {
            const token = jwt.sign({id : user._id , email} , 'shhhhh', {expiresIn: '2h'})

            user.pasword = undefined
            user.token = token

            const options = {
                expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),// 3 days formulla
                httpOnly:true
            }
            res.status(200).cookie("token",token,options).json({
                success:true,
                token,
                user
            })
        }
        res.sendStatus(400).send("email or password is incorrect")

        //create token and send
        
    } catch (error) {
        console.log(error);
    }
})


app.get('/dashboard' , auth , (req ,  res) => {
    res.send("welcome to dashboard")
})


module.exports = app
