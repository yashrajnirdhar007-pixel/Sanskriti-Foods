const Razorpay = require('razorpay');
const instance = new Razorpay({ key_id: 'rzp_test_invalid', key_secret: 'invalid' });
instance.orders.create({ amount: 100, currency: 'INR', receipt: 'r1' }).then(console.log).catch(e => console.log('ERROR:', JSON.stringify(e, null, 2)));
