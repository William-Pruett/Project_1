const express = require('express')
const passport = require('passport')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync')
const users = require('../controllers/users')
const { storeReturnTo } = require('../middleware')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogIn)
    .post(storeReturnTo, passport.authenticate('local',
        { failureFlash: true, failureRedirect: '/login' }), users.logIn);

router.get('/logout', users.logOut)



module.exports = router;