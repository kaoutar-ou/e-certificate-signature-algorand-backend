const res = require("express/lib/response");

const mongoose = require('mongoose');
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
const connectDB = async () =>
{
    const conn = await mongoose.connect(process.env.MONGO_URI,connectionParams);
    console.log('MongoDB connected ');
}

module.exports = connectDB;