const jwt=require("jsonwebtoken");

const auth=async(req,res,next)=>{
    try {
        const verify=await jwt.verify(req.cookies.loginSellerCookie,"mynameisbaibhavkumarbadalandiamsoftwareengineer");
        next();
    } catch (error) {
        res.status(400).send("U must Login......");
    }
}

module.exports=auth;