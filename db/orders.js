const db=require("./db.js");
const mongoose=db.mongoose;

//order schema for product
const orderSchema=new mongoose.Schema({
    email_customer:{
        type:String,
        required:true
    },
    email_seller:{
        type:String,
        required:true
    },
    name:String,
    Quantity:Number,
    price:Number
})

const orders= new mongoose.model('orders',orderSchema);

module.exports.orders = orders;
