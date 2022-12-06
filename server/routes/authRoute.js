const express = require('express')
const router = express.Router()
const { signIn,
    signOut,
    requireSignIn,
    hasAuthorization,
    // refreshTheToken 
} = require('../controllers/authController')

//routes

//router.post('/api/refresh', refreshTheToken)
router.post('/api/signin', signIn)
router.get('/api/signout', signOut)
// router.route('/api/signout')
//     .get(authCtrl.signout)

module.exports = router