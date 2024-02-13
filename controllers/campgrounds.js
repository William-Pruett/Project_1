const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, resp) => {
    const campgrounds = await Campground.find({}).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    resp.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, resp) => {
    resp.render('campgrounds/new')
}
module.exports.createCamp = async (req, resp, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save()
    console.log(campground)
    req.flash('success', 'You made a new Campground!')
    resp.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCamp = async (req, resp) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!')
        return resp.redirect('/campgrounds')
    }
    resp.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, resp) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!')
        return resp.redirect('/campgrounds')
    }
    resp.render('campgrounds/edit', { campground });
}

module.exports.updateCamp = async (req, resp) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...img)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'You updated the Campground!')
    resp.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCamp = async (req, resp) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    resp.redirect('/campgrounds')
}