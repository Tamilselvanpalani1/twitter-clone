import { type } from '@testing-library/user-event/dist/type';
import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    follwers: {
        //
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        default: []
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        default: []
    },
    profileImg: {
        type: String,
        default: ""
    },
    coverImg: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    }
}, {timestamps: true} )
//timestamp -> mongoDb by default will add when data has been stored and updated.

//creating a model
const User = new mongoose.model('User', UserSchema)
export default User;


