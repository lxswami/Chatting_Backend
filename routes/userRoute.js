const express = require("express")
const userRoute = express();
const userControllerFile = require("../controller/userController");
// const upload = require("../middlware/upload");
// const auth = require('../middlware/auth');
const auth = require("../middlware/auth")    //auth m token bhjna jaruri hota h h front se
const upload = require("../config/multer")

userRoute.use(express.json());

// const authenticate = userControllerFile.authenticate;

userRoute.post('/user/register', upload.single("image"), userControllerFile.Register);

userRoute.post('/user/login', userControllerFile.login);

userRoute.get('/findAlluser', userControllerFile.AllUser);

userRoute.post('/user/update', userControllerFile.UpdateUser);

userRoute.post('/profile/update', upload.single("image"), userControllerFile.profileUpdate);

userRoute.post('/delete/user', userControllerFile.deleteUser);

userRoute.post('/search/user', auth, userControllerFile.searchUser);



module.exports = userRoute