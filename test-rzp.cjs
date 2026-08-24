const Razorpay = require("razorpay");
const id = process.env.RAZORPAY_KEY_ID;
const secret = process.env.RAZORPAY_KEY_SECRET;
const instance = new Razorpay({ key_id: id, key_secret: secret });
instance.orders.create({ amount: 100, currency: "INR", receipt: "test" })
  .then(order => console.log("Success!"))
  .catch(err => console.error(err));
