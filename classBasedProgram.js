

localStorage.clear();
class Book {

    constructor(title, author, bookISBN) {

        this.title = title;

        this.author = author;

        this.bookISBN = bookISBN;

        this.checkedOut = false;

        this.checkedCount = 0;

        this.dueDate = null;

        this.rating = [];

        this.comments = [];

        this.transactions = [];
    }
}


//--------------------------------------------------------

class InvalidISBN extends Error {

    constructor(message) {
        super(message);
        this.name = "InvalidISBN";
    }
}

//--------------------------------------------------------
class Library {

    constructor() {

        this.MAX_COUNT = 3;

        this.loadLibraryFromLocalStorage();
    }

    //-------------------------------------------------------------------

    createBook(title, author, bookISBN) {

        return new Book(title, author, bookISBN);
    }

    //-------------------------------------------------------------------

    addToLibrary(newBook) {

        try {

            const duplicateBook = this.library.find((book) => book.bookISBN === newBook.bookISBN);

            if (duplicateBook) {

                throw new Error("The ISBN already exists!!!");
            }

            this.library.push(newBook);

            this.saveLibraryToLocalStorage();

        }

        catch (err) {

            console.error(err);
        }
    }

    //-------------------------------------------------------------------


    checkedOutBook(bookISBN, noOfDays = 7, user) {

        try {

            if (noOfDays <= 0) {

                throw new Error("You entered an invalid number of days.");

            }

            const book = this.getTheBook(bookISBN);

            if (!book) {

                throw new Error(`Book with ISBN "${bookISBN}" not found.`);
            }

            book.checkedOut = true;

            book.checkedCount++;

            let books = this.transaction(user);

            book.transactions.push(books);

            const dueDate = new Date();

            dueDate.setDate(dueDate.getDate() + noOfDays);

            book.dueDate = dueDate;

            console.log(`Checked out: "${book.title}", \n Due Date: ${dueDate}`);

            this.saveLibraryToLocalStorage();


        } catch (err) {

            console.error(err);

        }
    }

    //-------------------------------------------------------------------

    returnBook(isbn, user) {

        const book = this.getTheBook(isbn);

        if (book && book.checkedCount !== 0) {

            book.checkedOut = false;

            const now = new Date();

            let books = this.transaction(user);

            book.transactions.push(books);

            console.log(`The book "${book.title}" has been returned`);
        }
    }

    //-------------------------------------------------------------------


    transaction(user) {

        const currentDate = new Date();

        let transactionValues = {};

        let checkingCondition = 0;

        this.library.filter((book) => {

            checkingCondition = book.checkedCount !== 0;

            if (book.checkedOut && checkingCondition) {

                transactionValues.Date = currentDate;

                transactionValues.Type = "CheckedOut";

                transactionValues.User = user;
            }

            else if (!book.checkedOut && checkingCondition) {

                transactionValues.Date = currentDate;

                transactionValues.Type = "Returned";

                transactionValues.User = user;
            }
        });

        return (transactionValues);
    }


    //-------------------------------------------------------------------


    findBookByAuthor(authorName) {

        const booksByAuthor = [];

        try {

            this.library.forEach((book) => {

                if (book.author === authorName) {

                    booksByAuthor.push(book);
                }
            });

            if (booksByAuthor.length === 0) {

                throw new Error("No books found by this author.");
            }

            return booksByAuthor;

        } catch (error) {

            console.error(error);
        }
    }



    //-------------------------------------------------------------------


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


    //-------------------------------------------------------------------


    rateBook(isbn, rating, comment) {

        const book = this.getTheBook(isbn);

        if (book) {

            if (rating >= 1 && rating <= 5) {

                book.rating.push(rating);

                book.comments.push(comment);

                this.saveLibraryToLocalStorage();

                console.log(`The book name "${book.title}" has the rating:`, book.rating);
            }

        }
    }

    //-------------------------------------------------------------------

    getAverageOfRating(isbn) {

        const book = this.getTheBook(isbn);

        if (book) {
            let arrayOfRating = book.rating;

            let sum = arrayOfRating.reduce((sum, current) => sum + current, 0);

            let average = sum / arrayOfRating.length;

            const result = Math.round(average * 100) / 100;

            return `The "${book.title}" has an average rating of ${result}`;
        }

    }

    //-------------------------------------------------------------------


    getTotalReview(isbn) {
        const book = this.getTheBook(isbn);

        if (book) {

            let reviews = book.rating.length + book.comments.length;

            return `The "${book.title}" has an total reviews of ${reviews}`;
        }
        else {
            console.warn("Enter the correct ISBN");
        }
    }


    //-------------------------------------------------------------------


    sortBooks(criteria) {

        console.log(`Sorted by using criteria ${criteria}`);

        let stored = this.library.sort((a, b) => {

            const criteriaA = a[criteria];
            const criteriaB = b[criteria];

            if (typeof criteriaA === 'string') {

                return (criteriaA.trim()).localeCompare(criteriaB.trim());

            } else if (typeof criteriaA === 'number') {

                return criteriaA - criteriaB;

            } else {
                return 0;
            }
        });
        return stored;
    }


    //-------------------------------------------------------------------


    filterReviews(criteria) {

        let stored = this.library.filter((book) => book[criteria].length !== 0);

        console.log(`Filtered by using criteria ${criteria}`);

        return stored;

    }


    //-------------------------------------------------------------------


    getTransactionHistory() {

        let TransHistory = [];
        let Trans = this.library.filter((book) => book.transactions.length !== 0);

        for (let t of Trans) {

            if (t) {

                for (let i = 0; i < t.transactions.length; i++) {

                    TransHistory.push(t.transactions[i]);
                }

            }

            else {

                console.warn("Something goes wrong!!");
            }
        }

        return TransHistory;
    }


    //-------------------------------------------------------------------


    getUserHistory() {

        let userHistory = [];

        let getUsers = this.library.filter((book) => book.transactions.length !== 0);

        for (let user of getUsers) {

            if (user) {

                for (let i = 0; i < user.transactions.length; i++) {

                    let userData = {};

                    if (user.transactions[i].Type === "CheckedOut") {

                        userData.Book = user.title;

                        userData.Name = user.transactions[i].User;

                        userHistory.push(userData);
                    }
                }
            }

            else {

                console.warn("Something goes wrong!!");
            }
        }

        return userHistory;
    }


    //-------------------------------------------------------------------


    getTheBook(isbn) {

        let book = this.library.find((book) => book.bookISBN === isbn);

        try {
            if (!book) {

                throw new InvalidISBN("Please Enter the correct ISBN number");

            } else {

                return book;
            }

        } catch (error) {

            console.error(error);
        }
    }


    //-------------------------------------------------------------------


    saveLibraryToLocalStorage() {

        localStorage.setItem('library', JSON.stringify(this.library));
    }


    //-------------------------------------------------------------------


    loadLibraryFromLocalStorage() {

        const libraryData = localStorage.getItem('library');

        this.library = libraryData ? JSON.parse(libraryData) : [];
    }


    //-------------------------------------------------------------------


    initializeLibrary() {

        this.library = [];

        this.loadLibraryFromLocalStorage();
    }
}

//--------------------------------------------------------------------------------------

const library = new Library();
const book1 = library.createBook("The story of my life", "Yash", 123);
const book2 = library.createBook("Will it be two-sided", "Meet", 456);
const book3 = library.createBook("My name is Hero", "Parth", 789);
const book4 = library.createBook("I started the War", "Ravi", 398);


//-------------------------------------------------------------------

library.addToLibrary(book1);
library.addToLibrary(book2);
library.addToLibrary(book3);
library.addToLibrary(book4);
console.log("\n");

//-------------------------------------------------------------------

console.group("Checked Out Books");
console.log("List of all the books:");
library.checkedOutBook(456, 1, "Dhruvik");
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Checked Out Books");
console.log("List of all the books:");
library.checkedOutBook(123, 1, "Rishi");
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Returned Books");
console.log("List of all the books:");
library.returnBook(456, "Dhruvik");
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Library:");
console.log("List of all the books:");
console.table(library.library);
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------



console.group("Books By same Author:");
console.log("List of all the books:");
console.table(library.findBookByAuthor("Meet"));
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Ratings:");
console.log("Ratings Of the book:");
library.rateBook(456, 4.345, 'This is not a good book');
library.rateBook(456, 3.567);
library.rateBook(123, 1.57, "OMG");
library.rateBook(456, 4.344, "Hello");
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Average Ratings:")
console.log(library.getAverageOfRating(456));
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Average Reviews:")
console.log(library.getTotalReview(456));
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("OverDueDate Books:-");
console.log("List of overdue date books",);
console.table(library.listOverDueDate());
console.groupEnd();
console.log("\n");
console.log("\n");
//-------------------------------------------------------------------


console.group("Sorted Books:-");
console.log("List of sorted books",);
console.table(library.sortBooks('transactions'));
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Filtered Reviews:-");
console.log("List of filtered books",);
console.table(library.filterReviews('rating'));
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Transactions:-");
console.log("List of transaction books",);
console.table(library.getTransactionHistory());
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Users:-");
console.log("List of Users borrowed books",);
console.table(library.getUserHistory());
console.groupEnd();
console.log("\n");
console.log("\n");

//-------------------------------------------------------------------


console.group("Library:");
console.log("List of all the books:");
console.table(library.library);
console.groupEnd();



