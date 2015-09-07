/*
 * dbx
 * Error class
 */

function Error(message) {
    this.type = 0;
    this.message = '';
    this.internalMessage = '';
}

module.exports = Error;
