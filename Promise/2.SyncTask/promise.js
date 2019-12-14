function MyPromise(fn) {
  let self = this; // store the current promise instance
  self.value = null; // success value
  self.error = null; // error reason
  self.onFulfilled = null; // success callback
  self.onRejected = null; // fail callback

  function resolve(value) {
    setTimeout(() => {
      self.value = value;
      self.onFulfilled(self.value);
    }, 0);
  }

  function reject(error) {
    setTimeout(() => {
      self.error = error;
      self.onRejected(self.error);
    }, 0);
  }
  fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  // register the success callback and fail callback
  this.onFulfilled = onFulfilled;
  this.onRejected = onRejected;
};
module.exports = MyPromise;
