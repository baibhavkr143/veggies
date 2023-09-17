const express = require("express");
require("../db/orders.js");
const cors=require("cors");
const app = express();
const env=require("dotenv");
env.config({path:"../backend/config.env"});

const corsOptions = {
  origin: [
    'https://vegitablemarketlogs.onrender.com',
    'http://localhost:3000',
    'https://veggies-seller.onrender.com',
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(require("../router/customer.js"));
app.use(require("../router/seller.js"));
app.use(require("../router/customeForgotPassword.js"));
app.use(require("../router/sellerForgotPassword.js"));
app.use(require("../router/order.js"));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

const port=process.env.PORT ||8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
