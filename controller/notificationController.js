const notificationModelFile = require("../modules/notificationModel");



module.exports.sendNotification = async (req, res) => {

    try {

        const { roomId, senderId, users, messageText } = req.body

        const otherUsers = users.filter(
            (userId) => userId.toString() !== senderId.toString()
        );

        const notification = otherUsers.map((userId) => ({
            user: userId,
            sender: senderId,
            chatRoom: roomId,
            message: messageText,
        }))


        await Notification.insertMany(notification);

        res.json({
            status: 200,
            success: true,
            message: "Notification sent succesfully"
        })

    } catch (error) {
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }



}


module.exports.getAllNotification = async (req, res) => {
    try {

        const userId = req.user.id;

        const notifications = await Notification.find({ user: userId })
            .populate("sender", "name")
            .populate("chatRoom", "name image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications fetched",
            data: notifications,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}


module.exports.markAsRead = async (req, res) => {
    try {

        const userId = req.user.id;
        await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


