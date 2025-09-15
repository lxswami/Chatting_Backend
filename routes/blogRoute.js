const express = require("express")
const blogRoute = express();
const blogControllerFile = require("../controller/blogController");
// const upload = require("../middlware/upload");
// const auth = require('../middlware/auth');
const auth = require("../middlware/auth")
const upload = require("../config/multer")


blogRoute.use(express.json());

blogRoute.post('/blog/create', upload.single("image"),blogControllerFile.createBlog);

blogRoute.post('/all/blog',blogControllerFile.AllBlog);



blogRoute.post('/delete/blog',blogControllerFile.deleteBlog);




module.exports =blogRoute