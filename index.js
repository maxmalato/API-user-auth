import dotenv from "dotenv"; // Sensitive files that are saved on the local machine
dotenv.config();

import express, { json } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Password handling
import jwt from "jsonwebtoken";

const app = express()

// CONFIG JSON RESPONSE
app.use(express.json())

// IMPORT MODELS
import User from './models/User.js'

// OPEN ROUTE
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to API!" })
})

// PRIVATE ROUTER
app.get('/user/:id', async (req, res) => {
    const id = req.params.id

    // CHECK USER EXITS
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" })
    }
    try {
        const user = await User.findById(id, '-password')

        res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: "Server error. Try again later" })
    }
})

function checkToken (req, res, next) {
    //
}

// REGISTER USER
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body

    // VALIDATIONS
    if (!name) {
        return res.status(422).json({ message: "The name is required." })
    }
    if (!email) {
        return res.status(422).json({ message: "The email is required." })
    }
    if (!password) {
        return res.status(422).json({ message: "The password is required." })
    }
    if (password !== confirmPassword) {
        return res.status(422).json({ message: "The passwords are not the same." })
    }

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ message: "Registered e-mail. Please, use another e-mail." })
    }

    // CREATE PASSWORD
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // CREATE USER
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({ message: "User created sucessfully." })

    } catch (error) {
        res.status(500).json({ message: "Server error. Please, try again later." })
        console.log(error)
    }
})

// LOGIN OR AUTH USER
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    // VALIDANTIONS
    if (!email) {
        return res.status(422).json({ message: "The e-mail is required." })
    }
    if (!password) {
        return res.status(422).json({ message: "The password is required." })
    }

    // CHECK IF USER EXISTS
    const user = await User.findOne({ email: email })

    if (!user) {
        res.status(404).json({ message: "User not found." })
    }

    // CHECK IF PASSWORD MATCH
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(404).json({ message: "Invalid password." })
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, secret)

        res.status(200).json({ message: "Login sucessfully", token })

    } catch (error) {
        res.status(500).json({ message: "Server error. Try again later" })
        console.log(error)
    }

})

// CREDENCIALS
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@jwt-nodejs.jl60s.mongodb.net/?retryWrites=true&w=majority&appName=JWT-NodeJS`)
    .then(() => {
        // PORT
        app.listen(3000)
        console.log("Connected in the MongoDB.")
    })
    .catch((err) => { console.log(err) })