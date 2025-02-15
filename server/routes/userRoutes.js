const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const{set}=require('mongoose');
const accessControl=require('../utils/access-control').accessControl;

function setaccessControl(access_types){
    return(req,res,next)=>{
        accessControl(access_types,req,res,next)
    }
}

router.post('/users',userController.createUser);
router.get('/users', userController.getAllUsers);
router.get('/user/:id', userController.getSingleUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/userprofile', userController.viewUserProfile);
router.put('/updateUser',userController.updateUser)
router.post('/follow/:targetUserId', userController.followUser);
router.post('/unfollow/:targetUserId', userController.unfollowUser);
router.get('/users/:userId/followers',userController.viewFollowers);
router.get('/users/:userId/following', userController.viewFollowing);
router.get('/search',userController.search)
module.exports = router;