const express = require("express");
const app = express();
const env=require("dotenv");
env.config({path:"../backend/config.env"});
app.use(express.json());
app.use(require("../router/customer.js"));
app.use(require("../router/seller.js"));
app.use(require("../router/customeForgotPassword.js"));
app.use(require("../router/sellerForgotPassword.js"));
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

const port=process.env.PORT ||8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
