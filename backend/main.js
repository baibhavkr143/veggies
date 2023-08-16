const express = require("express");
const app = express();

app.use(express.json());
app.use(require("../router/customer.js"));
app.use(require("../router/seller.js"));
app.use(require("../router/customeForgotPassword.js"));
app.use(require("../router/sellerForgotPassword.js"));
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
