    const express = require("express");
    const router = express.Router();
    const Listing = require("../models/listing.js");
    const wrapAsync = require("../utils/wrapAsync.js");
    const ExpressError = require("../utils/ExpressError.js");
    const multer= require('multer');
    const { storage } = require("../cloudConfig.js");
    const { cloudinary } = require("../cloudConfig");
    const upload = multer({ storage });
    // cloudinary
    const { listingSchema } = require("../schema.js");
    const { isLoggedIn,isOwner } = require("../middleware.js");

    // 1. Index Route
   // 1. Index Route
router.get("/", wrapAsync(async (req, res) => {

    const { search } = req.query;
    console.log("Search:", search);

    let alllistings;

    if (search) {

        alllistings = await Listing.find({
            $or: [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    location: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    country: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        });

    } else {

        alllistings = await Listing.find({});
        console.log(alllistings);

    }

    res.render("listings/index.ejs", {
        alllistings,
        search
    });

}));

    // 2. New Route
    router.get("/new", isLoggedIn, (req, res) => {
        res.render("listings/new.ejs");
    });

    // 3. Show Route
    router.get("/:id", wrapAsync(async (req, res) => {
        let { id } = req.params;

        const listing = await Listing.findById(id).populate("reviews");

        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    }));

    // 4. Create Route
    router.post(
        "/",
        isLoggedIn,
        upload.single("image"),
        wrapAsync(async (req, res) => {
//             console.log("FILE:", req.file);
// console.log("BODY:", req.body);
// console.log(req.file);
// console.log(process.env.CLOUD_NAME);

            let result = listingSchema.validate(req.body);

            if (result.error) {
                throw new ExpressError(400, result.error);
            }

             if (!req.file) {
            throw new ExpressError(400, "Please upload an image");
        }

            const newlisting = new Listing(req.body.listing);

            newlisting.image = {
                 url: req.file.path,
                 filename: req.file.filename
       };
            newlisting.owner = req.session.userId;

            await newlisting.save();

            req.flash("success", "New Listing Created!");

            res.redirect("/listings");
        })
    );

    // 5. Edit Route
    router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {

        let { id } = req.params;

        const listing = await Listing.findById(id);     

        res.render("listings/edit.ejs", { listing });
    }));

    // 6. Update Route
   router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("image"),

    wrapAsync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        // update text fields
        Object.assign(listing, req.body.listing);

        // if user uploads new image
        if (req.file) {

            // delete old cloudinary image
            await cloudinary.uploader.destroy(
                listing.image.filename
            );

            // save new image
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await listing.save();

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

    // 7. Delete Route
    router.delete("/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    await cloudinary.uploader.destroy(
      listing.image.filename
    );

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));
    module.exports = router;