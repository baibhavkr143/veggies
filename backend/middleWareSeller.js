const jwt=require("jsonwebtoken");
const env=require("dotenv");
env.config({path:"../backend/config.env"});
const key=process.env.PassKey;
const auth=async(req,res,next)=>{
    try {
        const verify=await jwt.verify(req.cookies.loginSellerCookie,key);
        next();
    } catch (error) {
        res.status(400).send("U must Login......");
    }
}

module.exports=auth;