const mongoose= require("mongoose");
const Review = require("./review");
const Schema= mongoose.Schema;

const listingSchema=new Schema({
    title: {
        type:String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: String
    },
    price: Number,
    location: String,
    country: String,
    owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
},
    reviews: [
        {
            type: Schema.Types.ObjectId,
        //     // stores only ids

        // //     type: String is allowed but 
        // //     type: ObjectId  ❌ Error.
        // thats why type: Schema.Types.ObjectId
            ref: "Review",
        }
//         Every MongoDB document automatically gets unique ID.

// Example:

// {
//    _id: ObjectId("6891ab23cd45"),
//    comment: "Nice",
//    rating: 5
// }

// Here:

// ObjectId("6891ab23cd45")
    ],
});
listingSchema.post("findOneAndDelete", async (listing) => {
//     because internally:

// findByIdAndDelete()

    if(listing){

        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        });

    }

});
// Mongoose automatically knows because:

// Listing.findByIdAndDelete(id)

// deletes ONE specific listing.

// Then middleware gets THAT deleted listing as parameter.
const Listing= mongoose.model("Listing",listingSchema);
module.exports= Listing;
