// public/utils/ExpressError.js
class ExpressError extends Error {
  constructor(a, b) {
    // two allowed call shapes:
    // new ExpressError(statusNumber, message)
    // new ExpressError(messageString, statusNumber)
    let status, message;

    if (typeof a === "number") {
      status = a;
      message = b || "Something went wrong";
    } else {
      // a is probably the message
      message = a || "Something went wrong";
      status = Number(b) || 500;
    }

    super(message);          // set Error.message
    this.status = status;    // numeric HTTP status
    // keep message on instance too (redundant with Error.message)
    this.message = message;
  }
}

module.exports = ExpressError;
