const express = require('express')
const router = express.Router()
const { createUser,
    getUserList,
    getUserById,
    fetchUser,
    updateUser,
    deleteUser } = require('../controllers/userController')

const {
    requireSignIn,
    hasAuthorization } = require('../controllers/authController')

//create user

router.post('/api/users', createUser)

//get all users
router.get('/api/users', getUserList)
//storing user data based on id
//router.param(`/api/users/:userId`, getUserById)

//fetching user based on id
router.get(`/api/users/:userId`, requireSignIn, fetchUser)



//update user 
router.put('/api/users/:userId', requireSignIn, hasAuthorization, updateUser)

//delete user
router.delete('/api/users/:userId', requireSignIn, hasAuthorization, deleteUser)




module.exports = router