
const jwt = require("jsonwebtoken");
const user = require("../modules/userModel")

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
// console.log(">>>",req.body);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: 401, success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Incoming Token:", token);
  console.log("SECRET_KEY:", process.env.SECRET_KEY);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded:", decoded);

 // ✅ IMPORTANT: Find full user from DB so we get _id and other info
    const currentUser = await user.findById(decoded.id).select("-password");

    if (!currentUser) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "User not found"
      });
    }

    req.user = currentUser;  // ✅ Full user object attached





//   or checak kr lena upr wale code se nhi hua to down wale ko uncomment karo
    //   req.user = {
    //   id: decoded.id,      //cha list me ek chat room show ho
     
    // };
    next();
  } catch (err) {
    console.log("JWT Verify Error:", err.message);
    return res.status(401).json({ status: 401, success: false, message: "Invalid token" });
  }
};



module.exports=auth