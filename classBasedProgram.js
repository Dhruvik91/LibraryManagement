class Book {
    constructor(title, author, bookISBN) {
        this.title = title;
        this.author = author;
        this.bookISBN = bookISBN;
        this.checkedOut = false;
        this.checkedCount = 0;
        this.dueDate = null;
        this.rating = [];
    }
}

class Library {
    constructor() {
        this.library = [];
        this.MAX_COUNT = 3;
        this.loadLibraryFromLocalStorage();
    }

    createBook(title, author, bookISBN) {
        return new Book(title, author, bookISBN);
    }

    addToLibrary(newBook) {
        const duplicateBook = this.library.find((book) => book.bookISBN === newBook.bookISBN);

        if (!duplicateBook) {
            this.library.push(newBook);
            this.saveLibraryToLocalStorage();
            return;
        } else {
            console.warn("The ISBN already exists:", newBook.bookISBN);
        }
    }

    checkedOutBook(isbn, noOfDays = 7) {
        if (noOfDays <= 0) {
            console.warn("You entered an invalid number of days.");
            return;
        }

        const book = this.getTheBook(isbn);

        if (!book) {
            console.warn("Book not found in the library.");
        } else if (book.checkedCount > this.MAX_COUNT) {
            console.warn("This book is unavailable for checkout.");
        } else if (book.checkedOut) {
            console.warn("This book is already checked out.");
        } else {
            book.checkedOut = true;
            book.checkedCount++;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + noOfDays);
            book.dueDate = dueDate;
            console.log(`Checked out: "${book.title}", Due Date: ${dueDate}`);
            this.saveLibraryToLocalStorage();
        }
    }

    returnBook(isbn) {
        const book = this.getTheBook(isbn);
        if (book) {
            book.checkedOut = false;
            this.saveLibraryToLocalStorage();
            console.log(`The book "${book.title}" has been returned`);
        } else {
            console.warn("Please enter the correct ISBN number");
        }
    }

    findBookByAuthor(authorName) {
        const booksByAuthor = [];
        this.library.forEach((book) => {
            if (book.author === authorName) {
                booksByAuthor.push(book.title);
            }
        });
        return booksByAuthor;
    }

    listOverDueDate() {
        const overdueBooks = [];
        const now = new Date();

        this.library.forEach((book) => {
            if (book.dueDate && book.dueDate < now) {
                overdueBooks.push(book.title);
            }
        });

        if (overdueBooks.length === 0) {
            console.warn("Everything is alright, no overdue books found.");
        }

        return overdueBooks;
    }

    rateBook(isbn, rating) {
        const book = this.getTheBook(isbn);

        if (book) {
            if (rating >= 1 && rating <= 5) {
                book.rating.push(rating);
                this.saveLibraryToLocalStorage();
            } else {
                console.warn("Enter the correct rating. It is not in the range of 1 to 5");
            }
        }
    }

    getAverageOfRating(isbn) {
        const book = this.getTheBook(isbn);

        if (book) {
            let arrayOfRating = book.rating;

            let sum = arrayOfRating.reduce((sum, current) => sum + current, 0);

            let average = sum / arrayOfRating.length;

            const result = Math.round(average * 100) / 100;

            return `The ${book.title} has an average rating of ${result}`;
        } else {
            console.warn("Enter the correct ISBN");
        }
    }

    sortBooks(criteria) {
        this.library.sort((a, b) => {
            const criteriaA = a[criteria];
            const criteriaB = b[criteria];
            return criteriaA.localeCompare(criteriaB);
        });
    }

    getTheBook(isbn) {
        return this.library.find((book) => book.bookISBN === isbn);
    }

    saveLibraryToLocalStorage() {
        localStorage.setItem('library', JSON.stringify(this.library));
    }

    loadLibraryFromLocalStorage() {
        const libraryData = localStorage.getItem('library');
        this.library = libraryData ? JSON.parse(libraryData) : [];
    }

    initializeLibrary() {
        this.library = [];
        this.loadLibraryFromLocalStorage();
    }
}

const library = new Library();
const book1 = library.createBook("The story of my life", "Ravi", 12344);
const book2 = library.createBook("Will it be two-sided", "Ravinath", 23456);
const book3 = library.createBook("My name is Hero", "Ravisankar", 45646);
const book4 = library.createBook("I started the War", "Ravi", 645646);

library.addToLibrary(book1);
library.addToLibrary(book2);
library.addToLibrary(book4);

console.group("Checked Out Books");
console.log("List of all the books:");
library.checkedOutBook(23456, 1);
console.groupEnd();

console.group("Returned Books");
console.log("List of all the books:");
library.returnBook(23456);
console.groupEnd();

console.group("Library:");
console.log("List of all the books:");
console.table(library.library);
console.groupEnd();
