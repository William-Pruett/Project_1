const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError.js')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, resp, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in');
        return resp.redirect('/login')
    }
    next();
}

module.exports.storeReturnTo = (req, resp, next) => {
    if (req.session.returnTo) {
        resp.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.validateCampground = (req, resp, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, resp, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You dont have Permission to do this');
        return resp.redirect(`/campgrounds/${id}`)
    }
    next();
}
module.exports.validateReview = (req, resp, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
module.exports.isReviewAuthor = async (req, resp, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You dont have Permission to do this');
        return resp.redirect(`/campgrounds/${id}`)
    }
    next();
}