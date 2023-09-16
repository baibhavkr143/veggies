const express = require("express");
require("../db/orders.js");
const cors=require("cors");
const app = express();
const env=require("dotenv");
env.config({path:"../backend/config.env"});

app.use(cors({ origin: 'https://vegitablemarketlogs.onrender.com' }));
<<<<<<< HEAD
app.use(cors({ origin: 'http://localhost:3001' }));
=======
app.use(cors({ origin: 'https://veggies-seller.onrender.com' }));
>>>>>>> ae189b9eebb4ae64a9d24ccc17f035eec1c060de
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
