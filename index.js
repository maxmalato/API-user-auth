import dotenv from "dotenv"; // Arquivos sensíveis que são guardados na máquina local
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Manuseio das senhas
import jwt from "jsonwebtoken";

const app = express()

// PORTA
app.listen(3000)

// OPEN ROUTE
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to API!"})
})