const User = require('../model/userModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { expressjwt } = require('express-jwt')


//function to refresh token  later



// function 





const signIn = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    console.log(email)
    const user = await User.findOne({ email })
    console.log(user)
    console.log(email)

    // let value =  await bcrypt.compare(password, user.password)
    // console.log(value)
    if (!user) {
        return res.status(401).json({ error: 'User with that email not found' })
    }
    //will check for a better way to handle email and password
    const value = await bcrypt.compare(password, user.password)
    console.log(value)
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ error: 'Email and password do not match ' })
    }

    const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    )

    //storing our token in the cookie
    res.cookie('jwt', token, { expire: new Date() + 1 })

    // console.log(user)
    // const accessToken = generateAccessToken(user)
    // const refreshToken = generateRefreshToken(user)

    //res.cookie('t', token, { expiresIn: new Date() + 999})
    // return res.status(200).json({
    //     'user': user,
    //     'accessToken': accessToken,
    //     'refreshToken': refreshToken,
    // }
    // )


    if (!token) {

        res.status(400).json({
            error: 'Could not sign you in no token generated'
        })
    }
    res.status(200).json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        }

    })

})


//optional when cookies not used in the frontend
const signOut = asyncHandler(async (req, res) => {

    res.clearCookie("jwt")
    return res.status(200).json({
        message: 'signed out'
    })
})



//method to verify if request has valid token in the header add to any routes to protect the routes
const requireSignIn = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: 'auth'
})


//protecting our routes for updating and deleting
const hasAuthorization = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //get token from our header
            token = req.headers.authorization.split(" ")[1]
            console.log(token)

            //verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            console.log({ decoded: decoded.id })
            //get the user
            req.user = await User.findById(decoded.id).select('-password')
            next()

        } catch (error) {
            console.log(error)
            return res.status(401).json({ error: 'Not Authorized ' })

        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No authorized Token')
    }

}

// const hasAuthorization = (req, res, next) => {
//     const authorized = req.profile && req.auth && req.profile._id === req.auth._id
//     if (!authorized) {
//         return res.status(403).json({
//             message: 'user is not authorized'
//         })
//     }

// }

module.exports = {
    signIn,
    signOut,
    requireSignIn,
    //refreshTheToken,
    hasAuthorization
}