const jwt=require("jsonwebtoken");

const auth=async(req,res,next)=>{
    try {
        const verify=await jwt.verify(req.cookies.loginCookie,"mynameisbaibhavkumarbadalandiamsoftwareengineer");
        next();
    } catch (error) {
        res.send("U must Login......");
    }
}

module.exports=auth;