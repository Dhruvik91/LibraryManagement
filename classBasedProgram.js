class Boook {

    constructor(title, author, bookISBN) {
        this.title = title;
        this.author = author;
        this.bookISBN = bookISBN;
        this.checkedOut = false;
        this.checkedCount = 0;
        this.dueDate = null;
        this.rating = []
    }
}