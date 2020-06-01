export { Queue };

class Queue {
  constructor() {
    this._queue = [];
  }

  enqueue(x) {
    this._queue.push(x);
  }

  dequeue() {
    return this._queue.shift();
  }
}
