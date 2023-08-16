const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db.js");
const cookieParser = require("cookie-parser");
const auth = require("../backend/middleWareCustomer.js");
const router_customer = express.Router();

router_customer.use(cookieParser());

router_customer.get("/customer/home", auth, (req, res) => {
  res.status(200).send("hello from customer side!");
});

//register user
router_customer.post("/customer/register", async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    val=await db.signUpDetails.findOne({ email: email });
    if (val){
      res.status(400).send("email already exists");
    } else {
      const new_doc = new db.signUpDetails(data);
      const result = await new_doc.save();
      if (result) console.log("data saved sucessfully....");
      res.status(200).json({message:"data saved sucessfully...."});
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//validation of login
router_customer.post("/customer/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await db.signUpDetails.find({ email });
    if (data.length > 0) {
      let comp = await bcrypt.compare(password, data[0].password);
      if (comp) {
        const token = await data[0].createToken();
        console.log(`token is  this ${token}`);
        res.cookie("loginCookie", token, {
          expires: new Date(Date.now() + 10000 * 60000),
          httpOnly: true,
        });
        res.status(200).json({message:"login sucess......"});
      } else res.status(400).json({message:"login fails"});
    } else res.status(400).send({message:"login fails....."});
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


//code for update the password field or name field of customer
router_customer.put("/customer/update", async (req, res) => {
  try {
    const email = req.body.email;
    const data = req.body;
    const Currpassword=data.Currpassword;
    const val=await db.signUpDetails.findOne({email: email});
    const check=await bcrypt.compare(Currpassword,val.password);
    if(check){
      var newPassword =data.newPassword;
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      const result = await db.signUpDetails.findOneAndUpdate(
        { email: email },
        { $set:{password:hashedNewPassword}},{new:true}
      );
      res.status(200).send(result);
      memoizeCustomerDetailes.invalidate(email);
    }
    else res.status(400).json({message:"invalid operation"});
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});


//logOut
router_customer.get("/customer/logout", (req, res) => {
  res.clearCookie("loginCookie");
  res.status(200).json({message:"logOut is sucess....."});
});

//api of customer
router_customer.get("/customer/details", async (req, res) => {
  try {
    data = await db.signUpDetails.find();
    res.status(200).send(data);
    //console.log(data);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

//api for customer particular detail using email address
const memoizeCustomerDetailes={
  cache:new Map(),
  get:async(email)=>{
     
    if(memoizeCustomerDetailes.cache.has(email)){
       return memoizeCustomerDetailes.cache.get(email);
    }
    try {
        data = await db.signUpDetails.findOne({ email: email });
        if(data){
          memoizeCustomerDetailes.cache.set(email,data);
          return data;
        }
      else return null; 
        return data;
    } catch (error) {
      throw error;
    }
  },
  invalidate(email){
    memoizeCustomerDetailes.cache.delete(email);
  }
}
router_customer.get("/customer/details/:email", async (req, res) => {
  try {
    const email = req.params.email;
    data = await db.signUpDetails.findOne({ email: email });
    res.status(200).send(data);
    //console.log(data);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});


//cart functionality
router_customer.post("/customer/addCart",async (req,res)=>{
  try {
       const data=req.body;
       const document=new db.cartData(data);
       const result=await document.save();
       if(result){
        res.status(200).json({message:"add to cart successFully"});
        memoizeCart.invalidate(data.email_customer);
       }
      else res.status(400).json({message:"error in adding to cart"});
  } catch (error) {
    console.log(`erorr is in addCart: ${error.message}`);
    res.status(400).send(error.message);
  }
})
router_customer.post("/customer/deleteCart",async (req,res)=>{
  try {
      const email_customer=req.body.email;
      const name=req.body.name;
      const result=await db.cartData.findOneAndDelete({email_customer:email_customer,name:name});
      if(result){
        res.status(200).json({message:"data deleted successfully"});
        memoizeCart.invalidate(email_customer);
      }
      else res.status(200).json({message:"erro is deleting data"});
  } catch (error) {
    
  }
})


// api of data for cart of customer
const memoizeCart={
  cache:new Map(),
  get:async(email)=>{
    try {
       if(cache.has(email))
       return cache.get(email);
      data=await db.cartData.find({email_customer:email});
      cache.set(email,data);
      return data;
    } catch (error) {
      throw error;
    }
  },
  invalidate(email){
    cache.delete(email);
  }
}
router_customer.get("/customer/cart/:email",async (req,res)=>{
  try {
      const email=req.params.email;
      const result=await memoizeCart.get(email);
      if(result)res.status(200).send(result);
      else res.status(400).send({message:"cart is empty"});
  } catch (error) {
     res.status(400).send(error.message);
     console.log(error.message);
  }
});

module.exports = router_customer;
