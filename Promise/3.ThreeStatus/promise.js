const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
  let self = this; // store the current promise instance
  self.value = null; // success value
  self.error = null; // error reason
  self.onFulfilled = null; // success callback
  self.onRejected = null; // fail callback
  self.status = PENDING;

  function resolve(value) {
    setTimeout(() => {
      // only if status is pending, we can change it to fulfilled and execute the success callback
      if (self.status === PENDING) {
        self.status = FULFILLED;
        self.value = value;
        self.onFulfilled(self.value);
      }
    }, 0);
  }

  function reject(error) {
    setTimeout(() => {
      // only if status is pending, we can change it to rejected and execute the fail callback
      if (self.status === PENDING) {
        self.status = REJECTED;
        self.error = error;
        self.onRejected(self.error);
      }
    }, 0);
  }
  fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  if (this.status === PENDING) {
    // register the success callback and fail callback
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
  } else if (this.status === FULFILLED) {
    // if status is fulfilled, execute the success callback with the value
    onFulfilled(this.value);
  } else {
    // if status is rejected, execute the fail callback with the error
    onRejected(this.error);
  }
};
module.exports = MyPromise;
