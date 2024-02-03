const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const Axios = require('axios');


public_users.post("/register", (req,res) => {
  
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
    if(!isValid(username)) {
      users.push({
        "username": username, 
        "password": password,
      });
      return res.status(200).json({message: "User added successfully"});
    }
    return res.status(200).json({message: "User already exist"});
  } else {
    return res.status(200).json({message: "username &/ password not provided"});
  }

});


// Get the book list available in the shop

/*
public_users.get('/books',function (req, res) {
  res.send(JSON.stringify(books,null,4));
}); */

function getBooks() {
  return new Promise((resolve, reject) => {
      resolve(books);
  });
}

// Get the book list available in the shop
public_users.get('/books', function (req, res) {
  getBooks().then((books) => res.send(JSON.stringify(books,null,4)));
});


/*public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Ensure ISBN is an integer between 1 and 10
    if (!Number.isInteger(parseInt(isbn)) || isbn < 1 || isbn > 10) {
      throw new Error('Invalid ISBN number. Must be an integer between 1 and 10');
    }

    // Retrieve the book details
    const bookDetails = books[isbn];

    // Check if the book exists
    if (!bookDetails) {
      throw new Error(`Book with ISBN ${isbn} not found`);
    }

    // Send the book details as JSON with a 200 OK status
    res.status(200).json(bookDetails);
  } catch (error) {
    // Handle errors appropriately
    const statusCode = error.status || 400; // Use error status if available, otherwise default to 400
    res.status(statusCode).json({ message: error.message });
  }
});
*/
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    // Convert the ISBN to a number to match the numeric keys in the books object
    const numericISBN = parseInt(isbn);

    //const booksData = require('./booksdb');

    // Check if the numericISBN exists in the booksData object
    if (books[numericISBN]) {
      resolve(books[numericISBN]);
    } else {
      reject(new Error('Book not found'));
    }
  });
};

public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  getBookByISBN(isbn)
    .then((book) => {
      res.json(book);
    })
    .catch((error) => {
      console.error('Error fetching book details:', error.message);
      res.status(404).json({ error: 'Book not found' });
    });
});

  
// Get book details based on author
/*public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author;
    const bookKeys = Object.keys(books);

    // Iterate through the books array and find the book with the matching author
    let matchingBooks = [];
    for (const key of bookKeys) {
        const book = books[key];
        if (book.author === authorParam) {
            matchingBooks.push({ id: key, ...book });
        }
    }

    if (matchingBooks.length === 0) {
        res.status(404).json({ message: 'Author not found in the books collection' });
    } else {
        res.json(matchingBooks);
    }
});*/

const getBookByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    // Decode the URL-encoded author parameter
    const decodedAuthor = decodeURIComponent(author);

    // Find the first book with the given decoded author in the booksData object
    const book = Object.values(books).find(book => book.author === decodedAuthor);

    if (book) {
      resolve(book);
    } else {
      reject(new Error('Book not found for the given author'));
    }
  });
};

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;

  getBookByAuthor(author)
    .then((book) => {
      res.json(book);
    })
    .catch((error) => {
      console.error('Error fetching book details by author:', error.message);
      res.status(404).json({ error: 'Book not found for the given author' });
    });
});



// Get all books based on title
/*public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title;
  const bookKeys = Object.keys(books);

  // Iterate through the books array and find the book with the matching title
  let matchingBooks = [];
  for (const key of bookKeys) {
      const book = books[key];
      if (book.title === titleParam) {
          matchingBooks.push({ id: key, ...book });
      }
  }

  if (matchingBooks.length === 0) {
      res.status(404).json({ message: 'Title not found in the books collection' });
  } else {
      res.json(matchingBooks);
  }
});*/

const getBookByTitle = (title) => {
  return new Promise((resolve, reject) => {
    // Find the first book with the given title in the booksData object
    const book = Object.values(books).find(book => book.title === title);

    if (book) {
      resolve(book);
    } else {
      reject(new Error('Book not found for the given title'));
    }
  });
};

public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;

  getBookByTitle(title)
    .then((book) => {
      res.json(book);
    })
    .catch((error) => {
      console.error('Error fetching book details by title:', error.message);
      res.status(404).json({ error: 'Book not found for the given title' });
    });
});


//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
      // Retrieve the ISBN from the request parameters
      const isbn = req.params.isbn;

      // Ensure ISBN is an integer between 1 and 10
      if (!Number.isInteger(parseInt(isbn)) || isbn < 1 || isbn > 10) {
          throw new Error('Invalid ISBN number. Must be an integer between 1 and 10');
      }

      // Retrieve the book details
      const bookDetails = books[isbn];

      // Check if the book exists
      if (!bookDetails) {
          throw new Error(`Book with ISBN ${isbn} not found`);
      }

      // Check if the book has reviews
      if (bookDetails.reviews && bookDetails.reviews.hasOwnProperty(isbn)) {
          const reviews = bookDetails.reviews[isbn];
          res.json({ isbn, reviews });
      } else {
          res.status(404).json({ message: 'Reviews not found for the provided ISBN' });
      }
  } catch (error) {
      // Handle errors appropriately
      const statusCode = error.status || 400; // Use error status if available, otherwise default to 400
      res.status(statusCode).json({ message: error.message });
  }
});

module.exports.general = public_users;
