const mongoose= require("mongoose");
const initdata = require("./data.js");
const Listing= require("../models/listing.js");

mongoose.connect("mongodb://localhost:27017/Airbnb")
.then(()=>{console.log("mongodb connected")})
.catch(err=>console.log(err));

const initDB= async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("yes");
}
initDB();