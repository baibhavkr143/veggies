const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");


const mdb = "mongodb+srv://suraj9801439605:Baibhav%409801@cluster0.buw5tri.mongodb.net/veggies?retryWrites=true&w=majority";
// mongoose.connect("mongodb://0.0.0.0:27017/Veggies", { useNewUrlParser: true}).then(() => {
//     console.log("connection sucessful");
// }).catch((err) => {
//     console.log(err);
// })
mongoose.connect(mdb,{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log("connection success");
}).catch((error)=>{
    console.log(error);
})

//customer Db work ................
const signUpSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    conformPassword:{
      type:String,
      required:true,
    },
    resetToken:String,
    resetTokenExpiry:Date
})
signUpSchema.methods.createToken=async function(){
    try {
        console.log("i am called");
        const token =await jwt.sign({_id:this._id},"mynameisbaibhavkumarbadalandiamsoftwareengineer");
        return token;
    } catch (error) {
        console.log(`token error is ${error}`);
    }
}
signUpSchema.pre('save',async function(next){
    if(this.isModified("password"))
    {
        this.password=await bcrypt.hash(this.password,12);
        this.conformPassword=await bcrypt.hash(this.conformPassword,12);
    }
    next();
})
const signUpDetails=new mongoose.model("signUpDetails",signUpSchema);



// working for seller side .....

const sellerLoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    conformPassword:{
      type:String,
      required:true,
    },
    resetToken:String,
    resetTokenExpiry:Date
});
sellerLoginSchema.methods.createToken=async function(){
    try {
        console.log("i am called");
        const token =await jwt.sign({_id:this._id},"mynameisbaibhavkumarbadalandiamsoftwareengineer");
        return token;
    } catch (error) {
        console.log(`token error is ${error}`);
    }
}
sellerLoginSchema.pre('save',async function(next){
    if(this.isModified("password"))
    {
        this.password=await bcrypt.hash(this.password,12);
        this.conformPassword=await bcrypt.hash(this.conformPassword,12);
    }
    next();
})
const seller_login = new mongoose.model("seller_login_details",sellerLoginSchema);

//schema of seller products

const sellerProductSchema=new mongoose.Schema({
    email: {type: "string", required: true},
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    category:{
        type:String,
        required:true
    },
    totalQuantity:{
        type:Number,
        required:true
    },
    remainQuantity:{
        type:Number,
        required:true
    }

});
sellerProductSchema.index({ email: 1, name: 1 }, { unique: true });
const seller_products=new mongoose.model("seller_products",sellerProductSchema);



//cart schema
const addCartSchema= new mongoose.Schema({
    email_customer:{
      type:String,
      required:true
    },
    email_seller:{
      type:String,
      required:true
    },
    name :{
       type:String
    }
});

addCartSchema.index({ email_customer: 1, name: 1 }, { unique: true });
const cartData=new  mongoose.model("CartData",addCartSchema);


module.exports.signUpDetails=signUpDetails;
module.exports.seller_login=seller_login;
module.exports.seller_products=seller_products;
module.exports.cartData=cartData;  
