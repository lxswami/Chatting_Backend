const dishModel = require("../modules/dishModel")

// ✅ 1. Create Dish
exports.createDish = async (req, res) => {
    try {
        const { title, rating, price, description } = req.body;

        const newDish = new dishModel({
            title,
            rating,
            price,  
            description,  
        });

        await newDish.save();

        res.json({
            status: 200,
            success: true,
            message: "Dish created successfully",
            data: newDish,
        });
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
};

module.exports.AllDish =async (req, res) => {


    try {
        const dishes = await dishModel.find();
        res.json({
            status: 200,
            success: true,
            total:dishes.length,
            data: dishes,
        });
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
}


module.exports.deleteDish = async (req, res) => {
    try {

        const { _id } = req.body

        const deleteDish = await dishModel.findByIdAndDelete(_id)
        if (!deleteDish) {
            res.status(404).json({
                status: 404,
                success: false,
                message: "Dish not found",
            })
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Dish deleted successfully",

        })

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        });
    }
}