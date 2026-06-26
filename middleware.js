const Listing = require("./models/listing");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {

    if (!req.session.userId) {

        req.flash("error", "You must be logged in");

        return res.redirect("/login");
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing.owner.equals(req.session.userId)) {

        req.flash(
            "error",
            "You don't have permission!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};
module.exports.isOwnerR = async (req, res, next) => {

    let { id,reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review.owner.equals(req.session.userId)) {

        req.flash(
            "error",
            "You don't have permission!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};