const express = require("express");

const router = express.Router({mergeParams: true});

const Listing = require("../models/listing.js");

const Review = require("../models/review.js");

const { isLoggedIn,isOwner,isOwnerR } = require("../middleware.js");



// add review
router.post("/",isLoggedIn, async (req, res) => {

    // find listing
    let listing = await Listing.findById(req.params.id);

    // create new review
    let newReview = new Review(req.body.review);

    // add review id inside listing
    listing.reviews.push(newReview);

    newReview.owner = req.session.userId;

    // save review
    await newReview.save();

    // save listing
    await listing.save();

    req.flash("success", "Review Added!");

    // redirect back
    res.redirect(`/listings/${listing._id}`);

});


// delete review
router.delete("/:reviewId",isLoggedIn,isOwnerR, async (req, res) => {

    let { id, reviewId } = req.params;

    // remove review id from listing
    await Listing.findByIdAndUpdate(id, {

        $pull: { reviews: reviewId }

    });

    // here reviews is field name

//     $pull Meaning
// MongoDB operator.
// Means:
// 👉 “Remove matching value from array.”
// Example
// $pull: { reviews: "bbb" }
// MongoDB does:
// Befor:
// ["aaa", "bbb", "ccc"]
// After:
//["aaa", "ccc"]
// Automatically removes matching item.

    // delete review document
    await Review.findByIdAndDelete(reviewId);
    // Delete actual review document
// this field(document) -->  reviews: []

    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);

});

module.exports = router;