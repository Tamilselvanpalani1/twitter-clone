import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema({
        type: {  //notification type: follow, like, comment
            type: String, 
            required: true,
            enum: ["follow", "like", "comment"] 
        },
        from: { //who triggered the notification
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        to: { //who will receive the notification
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        read: { //whether the notification has been read
            type: Boolean,
            default: false
        }
    }, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;