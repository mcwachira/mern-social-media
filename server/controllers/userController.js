const User = require('../model/userModel')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

//create user
const createUser = asyncHandler(async (req, res) => {
    //get data from the body
    const { name, email, password, confirmPassword } = req.body

    //check if all fields are present
    if (!name || !email || !password) {
        res.status(400)
        throw new Error('please add all the fields')
    }
    //check if the user exist
    const userExist = await User.findOne({ email }).exec()

    if (userExist) {
        res.status(400)
        throw new Error('user with that email exist')
    }

    //check if the passwords match then encrypt the password
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'passwords do not match' })
    }

    //generate hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
    })

    const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    )

    // send tokn via the cookie
    // res.cookie("jwt", token, {
    //     httpOnly: true,
    //     maxAge: maxAge * 1000, //convert 2h to ms; maxAge uses miliseconds
    // });


    if (user) {
        res.status(200).json({ user, token })
    } else {
        res.status(400)
        throw new Error('error creating user')
    }

})


//get list of users 
const getUserList = asyncHandler(async (req, res) => {


    const users = await User.find().select('name email updated created')

    if (!users?.length) {
        res.status(400).json({ message: 'no users found' })
    }

    res.status(200).json(users)
})


//find our user and storing the details in the req.profile
//this will be executed first when we navigate to /api/users/:userId
const getUserById = asyncHandler(async (req, res, next) => {

    const id = req.params.userId
    console.log(id)
    let user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({
            error: "User not found"
        })

    }
    req.profile = user
    console.log(req.profile)
    next()


})


//get individual user
const fetchUser = asyncHandler(async (req, res,) => {
    const id = req.params.userId
    console.log(id)
    let user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({
            error: "User not found"
        })

    }
    res.status(200).json(user)

})

// const fetchUser = asyncHandler(async (req, res,) => {
//     const userProfile = req.profile;
//     console.log(req.profile)

//     // userProfile.password = undefined;
//     if (!userProfile) {
//         return res.status(400).json({
//             error: "User profile not found"
//         })

//         return res.json(userProfile)
//     }
// })


// //get user by id

// const getUserById = asyncHandler(async (req, res) => {
//     const id = req.params.userId
//     console.log(id)
//     const user = await User.findById(id).select('name email')

//     if (!user) {
//         throw new Error(' No user with that id exits')
//     }

//     res.status(200).json(user)

// })


//updateUser

const updateUser = asyncHandler(async (req, res) => {
    const id = req.params.userId

    const { name, password, email } = req.body
    //check the data 

    if (!name || !email) {
        return res.status(400).json({ message: 'all fields are required' })
    }

    //check id the user exist
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: ' No user with that id exits' })
    }


    //check if username is already in use
    // const duplicateUser = await User.findOne({ username }).lean().exec()
    // if (duplicateUser && duplicateUser?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Username already in use' })
    // }


    //check if password is needed to change
    let updatedPassword

    if (password) {
        //hash the password
        updatedPassword = await bcrypt.hash(password, 10) //salt rounds
    }

    //update the user details
    const updatedUserDetails = {
        name: name,
        email: email,
        password: updatedPassword

    }

    const updatedUser = await User.findByIdAndUpdate(
        id, updatedUserDetails, {
        new: true
    })

    res.status(200).json(updatedUser)
})


//delete user
const deleteUser = asyncHandler(async (req, res) => {
    const id = req.params.userId
    const user = await User.findByIdAndDelete(id)
    // const user = req.profile
    // const deletedUser = await await user.remove()
    // const deletedUser = await User.findByIdAndDelete(id)

    // let user = req.profile
    // let deletedUser = await user.remove()
    // deletedUser.hashed_password = undefined
    // deletedUser.salt = undefined
    // res.json(deletedUser)

    if (!user) {
        throw new Error(' No user with that id exits')
    }
    res.status(200).json({ message: 'user deleted successfully' })
})


module.exports = {
    createUser,
    getUserList,
    getUserById,
    fetchUser,
    updateUser,
    deleteUser,
}