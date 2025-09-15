const express = require("express")
const dishRoute = express();
const dishController = require("../controller/dishController")


dishRoute.use(express.json());



dishRoute.post('/dish/create', dishController.createDish);

dishRoute.post('/all/dish', dishController.AllDish);

dishRoute.post('/delete/dish', dishController.deleteDish);



module.exports=dishRoute