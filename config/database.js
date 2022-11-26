const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL


exports.connect =()=>{
    mongoose.connect(MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("sccessss of DB"))
    .catch(error=>{
        console.log("DB fail")
        console.log(error);
        process.exit(1)
    })
}

