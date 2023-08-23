const db=require("../db/orders.js");
const cookieParser = require("cookie-parser");
const express=require("express");
const router=express.Router();
router.use(cookieParser());


router.post("/customer/order",async (req,res)=>{
    try {
        const data=req.body;
        const document= new db.orders(data);
        const result=document.save();
        if(result)res.status(200).json({message:result});
    } catch (error) {
        console.log(error.message);
        res.status(400).send(data);
    }
})

module.exports=router;