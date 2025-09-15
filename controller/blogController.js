const blogModel = require("../modules/blogModel");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary");
const fs = require("fs"); // for removing temp file

module.exports.createBlog = async (req, res) => {
  try {
    const { title, content, description } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    // ✅ Upload local file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "blogs",
    });

    // ✅ Remove local temp file
    fs.unlinkSync(req.file.path);

    // ✅ Save to DB
    const newBlog = new blogModel({
      title,
      slug,
      content,                    
      description,
      image: result.secure_url,
    });

    await newBlog.save();

    res.json({
      status: 200,
      success: true,
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};



module.exports.AllBlog = async (req, res) => {

    try {

        const blog = await blogModel.find();
        res.json({
            status: 200,
            success: true,
            message: "Blog list successfully",
            total: blog.length,
            data: blog
        })

    } catch (error) {

        res.json({
            status: 400,
            success: false,
            message: error.message
        })

    }

}


module.exports.deleteBlog = async (req, res) => {

    try {

        const { _id } = req.body

        const deleteBlog = await blogModel.findByIdAndDelete(_id);
        if (!deleteBlog) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Blog not found",
            })
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {

        res.status(400).json({
            status: 400,
            success: false,
            message: "error",
        });
    }
}