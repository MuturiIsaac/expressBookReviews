const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "Isaac",
  "password": "Mtu23"
}
];




const isValid = (username)=>{ 
  const user = users.filter(user => user.username === username);
  if(user.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  const user = users.filter(user => user.username === username);
  if (username === user[0].username && password === user[0].password) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
 
  if(isValid(username) && authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: username
    }, 'access')
    req.session.authorization = { accessToken}
    req.session.user = username

    return res.status(200).json({message: "User logged in"});
  }
  
  return res.status(401).json({message: "Access Denied"});
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const userReview = req.body.review;
    const user = req.session.user;

    // Find the book to be reviewed using the provided ISBN
    const bookToBeReviewed = books[isbn];

    // Check if the book exists
    if (!bookToBeReviewed) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Initialize the 'reviews' property if it doesn't exist
    if (!bookToBeReviewed.reviews) {
      bookToBeReviewed.reviews = {};
    }

    // Add or update the review for the current user
    bookToBeReviewed.reviews[user] = userReview;

    // Update the session with the modified book details
    req.session.book = bookToBeReviewed;

    return res.status(200).json({
      message: `Review: '${userReview}' was added/modified by '${user}'`,
      book: bookToBeReviewed
    });
  } catch (error) {
    // Handle errors appropriately
    const statusCode = error.status || 400; // Use error status if available, otherwise default to 400
    res.status(statusCode).json({ message: error.message });
  }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const user = req.session.user;

    // Find the book to be reviewed using the provided ISBN
    const bookToBeReviewed = books[isbn];

    // Check if the book exists
    if (!bookToBeReviewed) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    // Check if the 'reviews' property exists
    if (!bookToBeReviewed.reviews) {
      return res.status(404).json({ message: `No reviews found for Book with ISBN ${isbn}` });
    }

    // Check if the current user has a review for this book
    if (bookToBeReviewed.reviews[user]) {
      // Delete the review for the current user
      delete bookToBeReviewed.reviews[user];

      // Update the session with the modified book details
      req.session.book = bookToBeReviewed;

      return res.status(200).json({
        message: `Review deleted by '${user}'`,
        book: bookToBeReviewed
      });
    } else {
      return res.status(404).json({ message: `No review found for user '${user}' on Book with ISBN ${isbn}` });
    }
  } catch (error) {
    // Handle errors appropriately
    const statusCode = error.status || 400; // Use error status if available, otherwise default to 400
    res.status(statusCode).json({ message: error.message });
  }
});

 


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
