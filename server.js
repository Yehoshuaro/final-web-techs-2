const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("./models/User");
const nodemailer = require('nodemailer');
const Blog = require("./models/Blog");

const app = express();
const PORT = 3000;
const WEATHER_API_KEY = "741c4f47aee70150e0f0ca7db37ae172";
const FLAG_API_URL = "https://flagcdn.com/w320/";

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

app.put("/users/:id", async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: "Role updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
});


// My BMI

app.get('/bmi', (req, res) => {
    res.sendFile(__dirname + '/public/bmi.html');
});


// Nodemailer (I will divide it like that, because I am tired to search every time)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yerkhan2708@gmail.com',
        pass: 'here is the password, I will not give it by GitHub, haha',
    },
});

app.post('/send-email', (req, res) => {
    const { to, subject, message } = req.body;

    const mailOptions = {
        from: 'yerkhan2708@gmail.com',
        to,
        subject,
        text: message,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.json({ message: 'Error sending email' });
        }
        res.json({ message: 'Email sent successfully!' });
    });
});

app.get('/email', (req, res) => {
    res.sendFile(__dirname + '/public/nodemailer.html');
});


// my blogs

app.get("/blogs", async (req, res) => {
    const blogs = await Blog.find();
    res.json(blogs);
});

app.post("/blogs", async (req, res) => {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
});

app.put("/blogs/:id", async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndUpdate(id, req.body);
    res.json({ message: "Blog was updated" });
});

app.delete("/blogs/:id", async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.json({ message: "Blog was deleted" });
});


// My Weather

app.get("/weather", async (req, res) => {
    try {
        const { city } = req.query;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(weatherUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.get("/time", async (req, res) => {
    try {
        const { city } = req.query;
        const timeUrl = `http://worldtimeapi.org/api/timezone/${city}`;
        const response = await axios.get(timeUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error getting the time, wait" });
    }
});

app.get("/airquality", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
        const response = await axios.get(airQualityUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

