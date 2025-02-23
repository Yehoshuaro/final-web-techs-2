const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1:27017/finalWeb")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully", redirect: "/main-page.html" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const redirectUrl = user.role === "admin" ? "/admin-main.html" : "/main-page.html";
        res.json({ message: "Login successful", redirect: redirectUrl });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error loading users" });
    }
});

// Добавить пользователя (Регистрация)
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// Обновить роль пользователя
app.put("/users/:id", async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: "Role updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
});

// Удалить пользователя
app.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
