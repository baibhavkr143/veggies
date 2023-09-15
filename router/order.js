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
        if(result)res.status(200).json({message:"sucess in order"});
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error);
    }
})


const memoizeOrderCus={
    cache:new Map(),
    async get(email)
    {
        try {
           if(this.cache.has(email))
           return this.cache.get(email);
            
           const data=await db.findOne({email_customer:email});
           if(data)
           this.cache.set(email,data);
            
           return data;

        } catch (error) {
            throw error;
        }
    },
    invalidate(email)
    {
        this.cache.delete(email);
    }
}
router.get("/customer/orderDetails/:email",async (req,res)=>{
    try {
        const email_customer=req.params.email;
        const result=await memoizeOrderCus.get(email_customer);
        if(result)
        res.status(200).send(result);
        else res.status(404).json({message:"invalid request"});
    } catch (error) {
        res.status(404).send(error);
    }
})

const memoizeOrderSeller={
    cache:new Map(),
    async get(email)
    {
        try {
           if(this.cache.has(email))
           return this.cache.get(email);
            
           const data=await db.findOne({email_seller:email});
           if(data)
           this.cache.set(email,data);
            
           return data;

        } catch (error) {
            throw error;
        }
    },
    invalidate(email)
    {
        this.cache.delete(email);
    }
}
router.get("/seller/orderDetails/:email",async (req,res)=>{
    try {
        const email_seller=req.params.email;
        const result=await memoizeOrderSeller.get(email_seller);
        if(result)
        res.status(200).send(result);
        else res.status(404).json({message:"invalid request"});
    } catch (error) {
        res.status(404).send(error);
    }
})



module.exports=router;