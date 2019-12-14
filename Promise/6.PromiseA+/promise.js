const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
  let self = this; // store the current promise instance
  self.value = null; // success value
  self.error = null; // error reason
  self.onFulfilled = []; // success callbacks
  self.onRejected = []; // fail callbacks
  self.status = PENDING;

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    setTimeout(() => {
      // only if status is pending, we can change it to fulfilled and execute the success callback
      if (self.status === PENDING) {
        self.status = FULFILLED;
        self.value = value;
        self.onFulfilled.forEach(callback => callback(self.value));
      }
    }, 0);
  }

  function reject(error) {
    setTimeout(() => {
      // only if status is pending, we can change it to rejected and execute the fail callback
      if (self.status === PENDING) {
        self.status = REJECTED;
        self.error = error;
        self.onRejected.forEach(callback => callback(self.error));
      }
    }, 0);
  }
  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

// resolve fulfilled return x, x could be a promise object or a value
function resolvePromise(bridgePromise, x, resolve, reject) {
  //2.3.1 avoid circular reference
  if (bridgePromise === x) {
    return reject(new TypeError("Circular reference"));
  }
  let called = false;
  if (x instanceof MyPromise) {
    // this branch is same with the next because promise is a thenable object, can delete
    if (x.status === PENDING) {
      x.then(
        y => {
          resolvePromise(bridgePromise, y, resolve, reject);
        },
        error => {
          reject(error);
        }
      );
    } else {
      x.then(resolve, reject);
    }
  } else if (x != null && (typeof x === "object" || typeof x === "function")) {
    try {
      // if x is a thenable object
      //2.3.3.1 let then be x.then
      let then = x.then;
      if (typeof then === "function") {
        //2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise.
        then.call(
          x,
          y => {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(bridgePromise, y, resolve, reject);
          },
          error => {
            if (called) {
              return;
            }
            called = true;
            reject(error);
          }
        );
      } else {
        //2.3.3.4 If then is not a function, fulfill promise with x.
        resolve(x);
      }
    } catch (e) {
      //2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
      if (called) {
        return;
      }
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  const self = this;
  // use bridgePromise to link up subsequent operations
  let bridgePromise;
  // set a default value
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : value => value;
  // set a default error
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : error => {
          throw error;
        };
  if (self.status === FULFILLED) {
    return (bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          // next promise resolve previous fulfilled return
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }));
  }
  if (self.status === REJECTED) {
    return (bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(self.error);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }));
  }
  if (self.status === PENDING) {
    // when use resolve/rejected async, store onFulfilled/onRejected to the callback array
    return (bridgePromise = new MyPromise((resolve, reject) => {
      self.onFulfilled.push(value => {
        try {
          let x = onFulfilled(value);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
      self.onRejected.push(error => {
        try {
          let x = onRejected(error);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }));
  }
};

MyPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

// test need
MyPromise.deferred = function() {
  let defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

try {
  module.exports = MyPromise;
} catch (e) {}
