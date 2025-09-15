const notificationControllerFile = require("../controller/notificationController")
const express = require("express")
const notificationRoute = express()

notificationRoute.use(express.json());


notificationRoute.post("/send/notification",notificationControllerFile.sendNotification)

notificationRoute.post("/all/notification",notificationControllerFile.getAllNotification)

notificationRoute.post("/mark/read/notification",notificationControllerFile.markAsRead)






module.exports =notificationRoute