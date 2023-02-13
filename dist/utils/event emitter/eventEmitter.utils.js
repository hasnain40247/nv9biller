"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class MyEventEmitter extends events_1.EventEmitter {
    constructor() {
        super();
    }
    emitEvent(event, data) {
        this.emit(event, data);
    }
    registerEvent(event, listener) {
        this.on(event, listener);
    }
}
const eventEmitter = new MyEventEmitter();
exports.default = eventEmitter;
