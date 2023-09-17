const express = require("express");
require("../db/orders.js");
const cors=require("cors");
const app = express();
const env=require("dotenv");
env.config({path:"../backend/config.env"});

app.use(cors({ origin: 'https://vegitablemarketlogs.onrender.com' }));
app.use(cors({ origin: 'http://localhost:3000' }));
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
