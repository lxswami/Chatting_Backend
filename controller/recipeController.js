const recipeModel = require("../modules/recipeModel")
const cloudinary = require("../config/cloudinary");
const fs = require("fs")



module.exports.createRecipe = async (req, res) => {

    try {
 
        const { title, price, description,category } = req.body;

        console.log(">>>>>",req.body);
        // return
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "recipes",
        });

        fs.unlinkSync(req.file.path);


        const newRecipe = new recipeModel({
            title,
            price,
            description,
            category,
            image: result.secure_url,   
            createdBy: req.user,   //auth me id le rakhi h             
            updatedBy: req.user,


        })

        await newRecipe.save()
        res.json({
            status: 200,
            success: true,
            message: "Recipe created successfully",          
            data: newRecipe
        })



    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })

    }
}


module.exports.AllRecipe = async (req, res) => {
    try { 

        const recipe = await recipeModel.find()
        res.json({
            status: 200,
            success: true,
            message: "All recipe get successfully",
            total: recipe.length,
            data: recipe
        })

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }



}


module.exports.updateRecipe = async (req, res) => {
    try {
        const { id, title, description, price } = req.body;    // auth file me id de di isliye yha se id mikal rha hu

        let imageUrl;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "recipes",
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);  
        }

        const updateData = {
            title,
            description,                                         
            price,
            updatedBy: req.user,  // ✅ ID from auth middleware
        };

        if (imageUrl) {             
            updateData.image = imageUrl;               
        }

        // ✅ Ye karo: ID + updated fields + { new: true }
        const updatedRecipe = await recipeModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedRecipe) {
            return res.json({
                status: 404,
                success: false,
                message: "Recipe not found",
            });
        }

        res.json({
            status: 200,
            success: true,
            message: "Recipe updated successfully",
            data: updatedRecipe,
        });

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
};




module.exports.DeleteRecipe = async (req, res) => {
    try {

        const { id } = req.body


        const deleteRecipe = await recipeModel.findByIdAndDelete(id)

        if (!deleteRecipe) {
            res.json({
                status: 404,
                success: false,
                message: "Recipe not found",
            })
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Recipe deleted successfully",
            data: deleteRecipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
}



module.exports.update=async(req,res)=>{

    try {
 
        const {title,descre} =req.body







    } catch (error) {
        
    }
}