/** Integration tests for books route */

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// isbn of sample book
let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url, author, language, pages, publisher, title, year)
      VALUES (
        '123432122',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);

    book_isbn = result.rows[0].isbn;
});

describe("POST /books", function () {
    // ... (existing test cases)

    test("Prevents creating a book without a required title", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({ year: 2000 });
        expect(response.statusCode).toBe(400);
    });
});

describe("GET /books", function () {
    // ... (existing test cases)

    test("Gets an empty list if no books are available", async function () {
        // Clear all books from the database
        await db.query("DELETE FROM BOOKS");
        const response = await request(app).get(`/books`);
        expect(response.body.books).toHaveLength(0);
    });
});

describe("GET /books/:isbn", function () {
    // ... (existing test cases)

    test("Responds with 404 if trying to find a non-existent book", async function () {
        const response = await request(app)
            .get(`/books/999`);
        expect(response.statusCode).toBe(404);
    });
});

describe("PUT /books/:isbn", function () {
    // ... (existing test cases)

    test("Prevents updating a book with invalid data", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                isbn: "32794782",
                badField: "DO NOT ADD ME!",
                // ... other fields
            });
        expect(response.statusCode).toBe(400);
    });

    test("Responds with 404 if trying to update a non-existent book", async function () {
        // Delete the book first
        await request(app).delete(`/books/${book_isbn}`);
        const response = await request(app).put(`/books/${book_isbn}`).send({
            // ... valid book data
        });
        expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /books/:isbn", function () {
    // ... (existing test cases)
});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
    await db.end();
});
