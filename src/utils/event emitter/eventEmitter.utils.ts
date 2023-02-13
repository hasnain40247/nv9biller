import { EventEmitter } from "events";

class MyEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

  public emitEvent(event: string, data: any) {
    this.emit(event, data);
  }

  public registerEvent(event: string, listener: (data: any) => void) {
    this.on(event, listener);
  }
}

const eventEmitter = new MyEventEmitter();
export default eventEmitter;
