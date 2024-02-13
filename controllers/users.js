const User = require('../models/user');

module.exports.renderRegister = (req, resp) => {
    resp.render('users/register')
}

module.exports.register = async (req, resp) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password)
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp')
            resp.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        resp.redirect('register')
    }

}

module.exports.renderLogIn = (req, resp) => {
    resp.render('users/login')
}

module.exports.logIn = (req, resp) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = resp.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    resp.redirect(redirectUrl)
}

module.exports.logOut = (req, resp, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!')
        resp.redirect('/campgrounds')
    })
}