const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db.js");
const cookieParser = require("cookie-parser");
const multer= require("multer");
const auth = require("../backend/middleWareSeller.js");
const router_seller = express.Router();

router_seller.use(cookieParser());
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router_seller.get("/seller/home", auth, (req, res) => {
  res.status(200).send("hello from seller side!");
});
router_seller.get("/seller/register", auth, (req, res) => {
  res.status(200).send("hello from receiver side!");
})
router_seller.get("/seller/viewProducts", auth, (req, res) => {
  res.status(200).send("hello from viewProduct");
});

//register user
router_seller.post("/seller/register", async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    const check = await db.seller_login.findOne({ email });
    if (check) {
      res.status(400).send("user already exists");
    } else {
      const new_doc = new db.seller_login(data);
      const result = await new_doc.save();
      if (result) console.log("data saved sucessfully....");
      res.status(200).json({ message: "data added sucessfully..." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//validation of login
router_seller.post("/seller/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await db.seller_login.find({ email });
    if (data.length > 0) {
      let comp = await bcrypt.compare(password, data[0].password);
      if (comp) {
        const token = await data[0].createToken();
        console.log(`token is  this ${token}`);
        res.cookie("loginSellerCookie", token, {
          expires: new Date(Date.now() + 10000 * 60000),
          httpOnly: true,
        });
        res.status(200).json({ message: "login sucess......" });
      } else res.status(400).json({ message: "login fails" });
    } else res.status(400).json({ message: "login fails....." });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
//logOut
router_seller.get("/seller/logout", (req, res) => {
  res.clearCookie("loginSellerCookie");
  res.status(200).json({ message: "logOut is sucess.....seller side ....." });
});

//update the password field of seller when current password matches the password on the server
router_seller.put("/seller/updateLogin", async (req, res) => {
  try {
    const email = req.body.email;
    const current_password = req.body.current_password;
    const new_password = req.body.new_password;
    const data = await db.seller_login.findOne({ email: email });
    if (!data) {
      res.status(400).json({ message: "user not found" });
    } else {
      const cmp = await bcrypt.compare(current_password, data.password);
      if (cmp) {
        const hashed_password = await bcrypt.hash(new_password, 12);
        const result = await db.seller_login.findOneAndUpdate(
          { email: email },
          { $set: { password: hashed_password } }
        );
      }
      res.status(200).json({ message: "password updated" });
    }
  } catch (error) {
    console.log(`error is in seller password update ${error.message}`);
    res.status(400).send(error.message);
  }
});

//api about seller
router_seller.get("/seller/details", async (req, res) => {
  try {
    const login_details = await db.seller_login.find();
    res.status(200).send(login_details);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

//api for getting details of particular sellers
const memoizeSellerLogin = {
  cache: new Map(),
  async get(email) {
    if (memoizeSellerLogin.cache.has(email)) {
      return memoizeSellerLogin.cache.get(email);
    }
    try {
      const data = await db.seller_login.findOne({ email });
      memoizeSellerLogin.cache.set(email, data);
      return data;
    } catch (error) {
      throw error;
    }
  },
  invalidateSellerLogin(email) {
    memoizeSellerLogin.cache.delete(email);
  },
};
router_seller.get("/seller/details/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const login_details = await memoizeSellerLogin.get(email);
    res.status(200).send(login_details);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

//registration of products..........................................
var product_data = [];
router_seller.post("/seller/RegisterProduct",async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    const name = data.name.toLowerCase();
    console.log(name);
    const product = await db.seller_products.findOne({ email, name });
    if (product) {
      res.status(400).json({ message: "product already exist" });
    } else {
      const new_doc = new db.seller_products(data);
      const result = await new_doc.save();
      res.status(200).json({message:"success in adding product"});
      console.log(result);
      //console.log(result);
      //memozie of work
      memoizedGetSellerProducts.invalidate(email);
      var key=name+"*"+email;
      memoizeProductName.invalidateCache(key);
      product_data = [];
      memoizeFilterProduct.invalidateCache();
    }
  } catch (error) {
    res.send(`error is in seller register product${error.message}`);
  }
});


router_seller.post(
  "/seller/products/updateRemainingQuantity",
  async (req, res) => {
    const session = await db.mongoose.startSession();
    session.startTransaction();
    try {
      const data = req.body;
      const email = data.email;
      const name = data.name;
      const QuantitySold = data.QuantitySold;

      // Use session with transaction for database operations
      const product = await db.seller_products.findOne({ email, name }).session(session);

      if (product) {
        if (product.remainQuantity >= QuantitySold) {
          const result = await db.seller_products.findOneAndUpdate(
            { email, name },
            { $set: { remainQuantity: product.remainQuantity - QuantitySold } },
            { session }
          );
          await session.commitTransaction();

          res.status(200).send(result);
          memoizedGetSellerProducts.invalidate(email);
          var key=name+"*"+email;
          memoizeProductName.invalidateCache(key);
          product_data = [];
          memoizeFilterProduct.invalidateCache();
          console.log(result);
        } else {
          await session.abortTransaction();
          res.status(400).json({ message: "Product is sold out" });
        }
      } else {
        await session.abortTransaction();
        res.status(400).json({ message: "Product does not exist" });
      }
    } catch (error) {
      await session.abortTransaction();
      res.status(500).send(`Error in seller update remaining quantity: ${error.message}`);
    } finally {
      session.endSession();
    }
  }
);

//code for adding quantity in total quantity of products
router_seller.post("/seller/products/addQuantity", async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    const name = data.name;
    const addedQuantity = parseInt(data.addedQuantity);

    const product = await db.seller_products.findOne({ email, name });
    if (product) {
      const result = await db.seller_products.findOneAndUpdate(
        { email, name },
        {
          $set: {
            totalQuantity: product.totalQuantity + addedQuantity,
            remainQuantity: product.remainQuantity + addedQuantity,
          },
        }
      );
      memoizedGetSellerProducts.invalidate(email);
      var key=name+"*"+email;
      memoizeProductName.invalidateCache(key);
      product_data = [];
      memoizeFilterProduct.invalidateCache();
      res.status(200).send(result);
    } else
      res.status(404).json({ message: "Product doesnot exist for update" });
  } catch (error) {
    res.status(404).json({ message: error.message });
    console.log(`error is in adding more quantity of product ${error.message}`);
  }
});

//code for deleting a product
router_seller.post("/seller/products/deleteProduct", async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    const name = data.name;
    const product = await db.seller_products.findOne({ email, name });
    if (product) {
      const result = await db.seller_products.findOneAndDelete({ email, name });
      memoizedGetSellerProducts.invalidate(email);
      var key=name+"*"+email;
      memoizeProductName.invalidateCache(key);
      product_data = [];
      memoizeFilterProduct.invalidateCache();
      res.status(200).send(result);
    } else {
      res.status(400).json({ message: "product does not exist" });
    }
  } catch (error) {
    res.status(400).send(`error is in seller delete product ${error.message}`);
  }
});

// Product Api of sellers
router_seller.get("/seller/products", async (req, res) => {
  try {
    if (product_data.length == 0)
      product_data = await db.seller_products.find().sort();
    res.status(200).send(product_data);
  } catch (error) {
    res.send(`error is in seller api product ${error.message}`);
    console.log(`error is in seller api product ${error.message}`);
  }
});

//product api of particular seller with memoization
const memoizedGetSellerProducts = (() => {
  cache = new Map();

  return {
    async get(email) {
      if (cache.has(email)) {
        return cache.get(email);
      }

      try {
        const particluarProductData = await db.seller_products.find({ email });
        cache.set(email, particluarProductData);
        return particluarProductData;
      } catch (error) {
        console.error(
          `Error in seller API of particular email product: ${error.message}`
        );
        throw error;
      }
    },

    invalidate(email) {
      cache.delete(email);
    },
  };
})();

router_seller.get("/seller/products/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const particluarProductData = await memoizedGetSellerProducts.get(email);
    if (particluarProductData) res.status(200).send(particluarProductData);
    else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(400)
      .send(
        `Error in seller API of particular email product: ${error.message}`
      );
  }
});

//api for particular name like apple ,banana,etc.......
const memoizeProductName = {
  cache: new Map(),
  async get(name,email) {
    var key=name+"*"+email;
    if (memoizeProductName.cache.has(key)) {
      return memoizeProductName.cache.get(key);
    }
    try {
      const product = await db.seller_products.findOne({email,name });
      if (product) {
        memoizeProductName.cache.set(key, product);
        return product;
      }
      return null;
    } catch (error) {
      throw error; // Rethrow the error to be caught by the route handler
    }
  },
  invalidateCache(key) {
    memoizeProductName.cache.delete(key);
  },
};

router_seller.post("/seller/products/particularProduct", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const product = await memoizeProductName.get(name,email);

    if (product) {
      res.status(200).send(product);
    } else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).send(`Error getting product: ${error.message}`);
  }
});

//api for filter product
const memoizeFilterProduct = {
  cache: new Map(),
  async get(key, filter) {
    try {
      if (memoizeFilterProduct.cache.has(key)) {
        return memoizeFilterProduct.cache.get(key);
      }
      const product = await db.seller_products.find(filter);
      if (product) {
        memoizeFilterProduct.cache.set(key, product);
        return product;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },
  invalidateCache() {
    memoizeFilterProduct.cache.clear();
  },
};

router_seller.post("/seller/products/filter", async (req, res) => {
  try {
    const data = req.body;
    const { name, minPrice, maxPrice, category } = data;
    const filter = {};
    var key = "";
    if (name) {
      filter.name = name;
      key += name + "*";
    }
    if (minPrice && maxPrice) {
      filter.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
      key += minPrice + "*" + maxPrice;
    } else if (minPrice) {
      filter.price = { $gte: parseFloat(minPrice) };
      key += minPrice + "*";
    } else if (maxPrice) {
      filter.price = { $lte: parseFloat(maxPrice) };
      key += maxPrice + "*";
    }
    if (category) {
      filter.category = category;
      key += category + "*";
    }
    //console.log(filter);
    const product = await memoizeFilterProduct.get(key, filter);
    res.status(200).send(product);
  } catch (error) {
    console.log(`erros is in filter of seller prduct: ${error.message}`);
    res
      .status(400)
      .send(`erros is in filter of seller prduct: ${error.message}`);
  }
});

module.exports = router_seller;
