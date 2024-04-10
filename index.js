const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: "User Management Project for MongoDB",
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3000' } 
    ]
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const uri = 'mongodb+srv://pavithragopal:1234@mern-blog.zlzmfaw.mongodb.net/usermanagement';
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await mongoose.connect(uri);
    app.listen(3000, () => { 
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
});

const User = mongoose.model('User', userSchema, 'users');

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  jwt.verify(token, 'secretkey', (err, user) => {
    if (err) {
      return res.status(403).send('Forbidden');
    }
    req.user = user;
    next();
  });
};

/**
 * @swagger
 * /:
 *  get: 
 *      summary: This api is used to check if get method is working or not
 *      description: This api is used to check if get method is working or not
 *      responses: 
 *            200:
 *                description: "Successful response"
 *                content:
 *                  text/plain:
 *                    schema:
 *                      type: string
 *                      example: "Hello World!"
 */

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: "Register a new user"
 *     description: "This endpoint is used to register a new user."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *             required:
 *               - username
 *               - name
 *               - password
 *               - gender
 *     responses:
 *       201:
 *         description: "User registered successfully"
 *       400:
 *         description: "Bad request - username, name, password and gender are required"
 *       409:
 *         description: "User already exists"
 *       500:
 *         description: "Internal server error"
 */

app.post("/register", async (req, res) => {
  try {
    const { username , name, password, gender } = req.body;
    if (!username || !name || !password || !gender) {
      return res.status(400).send("username, name, password and gender are required");
    }
    const existingUserByUsername = await User.findOne({ username: username });
    const existingUserByName = await User.findOne({ name: name });
    if (existingUserByUsername || existingUserByName) {
      return res.status(409).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      name: name,
      password: hashedPassword,
      gender: gender
    });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: "User login"
 *     description: "This endpoint is used for user authentication and login."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: "Successful login"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTUyMjE3YzQ5ODQ4ZjExOWFkNjdkOSIsIm5hbWUiOiJEaXZ5YSIsImlhdCI6MTY0NzAxNjE4M30.m4C3o2fXtFwd4y2qATsoVb3pFzBc-uw27bPZoxJVhHw"
 *       400:
 *         description: "Bad request - Username and password are required"
 *       401:
 *         description: "Invalid password"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("username and password are required");
    }
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }
    const token = jwt.sign({ id: user._id, username: user.username }, "secretkey");
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: "Get all users"
 *     description: "This endpoint retrieves all users from the database."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Successful response"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       401:
 *         description: "Unauthorized - Missing or invalid token"
 *       404:
 *         description: "No users found"
 *       500:
 *         description: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:           
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT   
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "User ID"
 *         username:
 *           type: string
 *           description: "User username"
 *         name:
 *           type: string
 *           description: "User name"
 *         password:
 *           type: string
 *           description: "User password"
 *         gender:
 *           type: string
 *           description: "User gender"
 */

app.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).send("No users found");
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /users/{username}:
 *   put:
 *     summary: "Update user details"
 *     description: "This endpoint is used to update user details."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: username of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               gender: 
 *                 type: string
 *             required:
 *               - name 
 *               - password
 *               - gender
 *               
 *     responses:
 *       200:
 *         description: "User details updated successfully"
 *       400:
 *         description: "Bad request - Username,name, password and gender are required"
 *       401:
 *         description: "Unauthorized - Missing or invalid token"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */

app.put("/users/:username", authenticateToken, async (req, res) => {
  try {
    const username = req.params.username; 
    const { name, password, gender } = req.body;
    if (!name || !password || !gender) {
      return res.status(400).send("name, password, and gender are required");
    }
    const user = await User.findOneAndUpdate(
      { username: username }, 
      { name: name, password: password, gender: gender }, 
      { new: true } 
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User details updated successfully");
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /deleteuser/{username}:
 *   delete:
 *     summary: "Delete user"
 *     description: "This endpoint is used to delete a user by username."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "User deleted successfully"
 *       401:
 *         description: "Unauthorized - Missing or invalid token"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */

app.delete("/deleteuser/:username", authenticateToken, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOneAndDelete({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send("Internal server error");
  }
});


