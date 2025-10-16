
class CircularBuffer {
    constructor(size) {
    this.buffer = new Float64Array(size);
    this.size = size;
    this.head = 0;
    this.tail = 0;
    this.length = 0;
    }
    
    push(value) {
    this.buffer[this.head] = value;
    this.head = (this.head + 1) % this.size;
    if (this.length === this.size) {
    this.tail = (this.tail + 1) % this.size;
    } else {
    this.length++;
    }
    }
    
    get(index) {
    if (index < 0 || index >= this.length) throw new Error('Index out of bounds');
    return this.buffer[(this.tail + index) % this.size];
    }
    
    average() {
    if (this.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
    sum += this.get(i);
    }
    return sum / this.length;
    }
    }
    
    module.exports = { CircularBuffer };
    