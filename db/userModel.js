const mongooose = require("mongoose")


const userSchema = mongooose.Schema({
    name: {
        type: String,
    },
    email:{
        type:String,
        unique:true,
    },
    picture:String,
    bio:{
        type:String,
    }
})

const User = mongooose.model('User',userSchema);


module.exports = User;