const User = require("../db/userModel")

const handleUpdateUserBio = async (req , res) =>{
    const user = req.user;
    const {bio} = req.body;
    if(!user){
    return res.status(400).json({ message: "User not found" });
    }

    try{
        const findUser = await User.findOne({_id:user});
        if(!findUser){ 
            return res.status(400).json({ message: "User not found" });
        }

        const updateData = await User.updateOne({_id:user},{bio:bio});
        console.log(updateData);
        return res.status(201).json({message:"success"})
    }catch(err){
        console.log(err)
    }
}



module.exports = handleUpdateUserBio;