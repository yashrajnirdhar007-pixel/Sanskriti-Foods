const id = process.env.RAZORPAY_KEY_ID;
const secret = process.env.RAZORPAY_KEY_SECRET;
console.log("ID length:", id ? id.length : 0);
console.log("Secret length:", secret ? secret.length : 0);
console.log("ID starts with space:", id ? id.startsWith(" ") : false);
console.log("Secret starts with space:", secret ? secret.startsWith(" ") : false);
console.log("Secret ends with space:", secret ? secret.endsWith(" ") : false);
