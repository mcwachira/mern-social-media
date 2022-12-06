const express = require('express')
const mongoose = require('mongoose')
const Post = require('../model/postModel')
const asyncHandler = require('express-async-handler')

// @desc Get all posts
// @route GET /posts
// @access Private

const getPosts = asyncHandler(async (req, res) => {
    const { page } = req.query
    console.log(page)



    try {

        //number of posts per page 
        const LIMIT = 4

        //gets the starting index of every page
        const startIndex = (Number(page) - 1) * LIMIT

        //get the number of documents in our collection
        const total = await Post.countDocuments({})


        //filtering the post based on the date created
        //showing a number of post per page based on the limit
        //loading only the necessary post based on startINdex not all posts
        const postMessages = await Post.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex)

        // if (!postMessages?.length) {
        //     return res.status(400).json({ message: 'Message do not exist' })
        // }

        res.status(201).json({ data: postMessages, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) })


    } catch (error) {

        return res.status(400).json({ message: `Error fetching all the posts ${error.message}` })
    }
})




// @desc  create POST
// @route POST /posts
// @access Private

const createPost = asyncHandler(async (req, res) => {


    //check if data exist 
    const postData = req.body;

    const postObject = {
        ...postData,

    }

    const post = await Post.create(postObject)

    if (!post) {
        return res.status(400).json({ message: `Error creating a post` })
    }
    res.status(200).json(post)



})


// @desc Get a specific post
// @route GET /posts
// @access Private

const getPostById = asyncHandler(async (req, res, next, id) => {

    // const { id } = req.params
    // console.log(id)
    const post = await Post.findById(id).populate('postedBy', '_id name').exec()
    if (!post) {
        return res.status('400').json({
            error: "Post not found"
        })
    }
    req.post = post
    return res.status(200).json(post)
    next()



})

// @desc list posts by users
// @route GET /posts
// @access Private
const listByUsers = asyncHandler(async (req, res) => {

    let posts = await Post.find({ postedBy: req.profile._id })
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .sort('-created')
        .exec()

    if (!posts) {
        return res.status('400').json({
            error: "error fetching posts"
        })
    }
    res.json(posts)



})


// @desc update post
// @route GET /specific post
// @access Private

const updatePost = asyncHandler(async (req, res) => {
    const { id: _id } = req.params

    //check if id is valid using Mongoose.Types

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).json({ message: 'No post with that id exists' })




    try {

        const { title, message, selectedFile, creator, tags } = req.body;

        //looking for the post based on the id
        const post = await Post.findByIdAndUpdate(
            _id,
            {
                title: title,
                message: message,
                tags: tags,
                selectedFile: selectedFile,
                creator: creator
            },

            //returns the updated post immediately after updating
            {
                new: true
            }

        )

        res.status(201).json(post)
    } catch (error) {
        res.status(400).json({ message: `updating the post failed ${error}` })
    }

})


// @desc Delete post
// @route DELETE /post
// @access Private

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params
    console.log(id)

    //check if id is valid using Mongoose.Types

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'No post with that id exists' })


    try {

        const deletedPost = await Post.findByIdAndRemove(id)
        res.status(201).json({ message: 'post deleted successfully' })


    } catch (error) {
        res.status(400).json({ message: `deleting the post failed ${error}` })

    }

})

// @desc Get a specific post
// @route GET /posts
// @access Private

const getPostBySearch = asyncHandler(async (req, res) => {
    const { searchQuery, tags } = req.query;// query = {sex:"female"}
    console.log(req.query)
    try {

        //formatting the title  i=   ignore case
        //using regex to  make it easier for mongoose to search
        const title = new RegExp(searchQuery, 'i');


        //searching by search term or tags
        //looking for tag in tags as tags is an array

        const searchedPost = await Post.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] })
        res.status(201).json({ data: searchedPost })

    } catch (error) {

        res.status(404).json({ message: error.message })
    }

})


const likePost = async (req, res) => {
    const { id } = req.params

    //check if user is verified

    if (!req.userId) {
        res.status(400).json({ message: 'user not  authenticated' })
    }

    //check if id is valid using Mongoose.Types

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'No post with that id exists' })

    try {


        //looking for the post based on the id

        const post = await Post.findById(id)

        //compare and check if the ids are the same 

        const index = post.likes.findIndex((id) => id === String(req.userId));

        if (index === -1) {
            post.likes.push(req.userId);
        } else {
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            post,
            // {
            //     likeCount: post.likeCount + 1
            // },

            //returns the updated post immediately after updating
            {
                new: true
            }

        )

        res.status(201).json(updatedPost)
    } catch (error) {
        res.status(400).json({ message: `updating the post failed ${error}` })
    }

}

module.exports = {
    createPost,
    getPosts,
    getPostBySearch,
    getPostById,
    listByUsers,
    updatePost,
    likePost,
    deletePost
}