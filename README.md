# User Management Project for MongoDB

This project implements a user management system using MongoDB as the database. It provides RESTful APIs for user registration, authentication, user details retrieval, updating user details, and user deletion.

## Setup Instructions

1. **Install Dependencies:** Run `npm install` to install all required dependencies.

2. **Start Development Server:** Execute `npm run dev` to start the development server.

3. **Database Connection:** Ensure your application is connected to MongoDB using the provided URL:
   ```mongodb
   mongodb+srv://pavithragopal:1234@mern-blog.zlzmfaw.mongodb.net/usermanagement


4. **Access API Documentation:** Visit the `/api-docs` endpoint to access the API documentation.

5. **Additional Information:** Refer to the Swagger documentation and source code for more detailed instructions and information.

## API Endpoints

### Register a New User

- **URL:** `/register`
- **Method:** `POST`
- **Description:** Register a new user.
- **Request Body:**
  ```json
  {
    "username": "example",
    "name": "John Doe",
    "password": "password123",
    "gender": "male"
  }
  ```
- **Responses:**
  - `201`: User registered successfully
  - `400`: Bad request - username, name, password, and gender are required
  - `409`: User already exists
  - `500`: Internal server error

### User Login

- **URL:** `/login`
- **Method:** `POST`
- **Description:** User login and authentication.
- **Request Body:**
  ```json
  {
    "username": "example",
    "password": "password123"
  }
  ```
- **Responses:**
  - `200`: Successful login (Returns a JWT token)
  - `400`: Bad request - Username and password are required
  - `401`: Invalid password
  - `404`: User not found
  - `500`: Internal server error

### Get All Users

- **URL:** `/users`
- **Method:** `GET`
- **Description:** Retrieve all users from the database.
- **Security:** Bearer Token
- **Responses:**
  - `200`: Successful response (Returns an array of user objects)
  - `401`: Unauthorized - Missing or invalid token
  - `404`: No users found
  - `500`: Internal server error

### Update User Details

- **URL:** `/users/:username`
- **Method:** `PUT`
- **Description:** Update user details.
- **Parameters:** Username of the user to update
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "password": "newpassword123",
    "gender": "female"
  }
  ```
- **Responses:**
  - `200`: User details updated successfully
  - `400`: Bad request - Username, name, password, and gender are required
  - `401`: Unauthorized - Missing or invalid token
  - `404`: User not found
  - `500`: Internal server error

### Delete User

- **URL:** `/deleteuser/:username`
- **Method:** `DELETE`
- **Description:** Delete a user by username.
- **Parameters:** Username of the user to delete
- **Responses:**
  - `200`: User deleted successfully
  - `401`: Unauthorized - Missing or invalid token
  - `404`: User not found
  - `500`: Internal server error

## Swagger Documentation

For detailed API documentation, visit the `/api-docs` endpoint after starting the server.

