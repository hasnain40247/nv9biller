import { logValue } from "./utils/logger/logValue.utils";
import config from "./utils/config/default";
import {
  I_MQTT,
  I_MQTT_EVENTS,
  I_MQTT_TOPICS,
} from "./interfaces/mqtt.interfaces";
import { v1 as uuidv1 } from "uuid";
import mqttInstance from "./modules/MqttHandler";
import CustomBiller from "./modules/CustomBiller";

const MQTT_TOPICS = config.get<I_MQTT_TOPICS>("MQTT_TOPICS");
const MACHINE_ID = config.get<string>("MACHINE_ID");
const EVENTS = config.get<I_MQTT_EVENTS>("EVENTS");

let queue_to_cash: Array<object> = [];
class CashCollector {
  amount_requested: number;
  amount_collected: number;
  request_id: number;
  stop_thread: boolean;
  _transaction_started: boolean;
  _is_paused: boolean;
  biller: CustomBiller;

  constructor() {
    this.amount_requested = 0;
    this.amount_collected = 0;
    this.request_id = 0;
    this.stop_thread = true;
    this._transaction_started = false;
    this._is_paused = true;

    this.biller = new CustomBiller(
      this.cashAddedCallback,
      this._pollingTimeOutCallback
    );
  }

  get is_transaction_pending(): boolean {
    return this._transaction_started;
  }

  async start(amount_requested: number, request_id: number): Promise<boolean> {
    let status = await this.biller.enableBiller();
    if (!status) {
      logValue("Failed to enable biller", true);
      return false;
    }
    let init_response = {
      machineId: MACHINE_ID,
      requestId: request_id,
      status: "READY",
      isReady: true,
      code: 100,
      message: "success",
    };

    let init_response_stringified = JSON.stringify(init_response);
    mqttInstance.publish(MQTT_TOPICS.INIT_RESPONSE, init_response_stringified);

    this.amount_collected = 0;
    this.stop_thread = false;
    this._transaction_started = true;
    this._is_paused = false;
    this.amount_requested = amount_requested;
    this.request_id = request_id;
    setTimeout(() => this._collectionThread(), 0);
    return true;
  }

  pause(): void {
    if (this._is_paused) {
      logValue("pause() called when transection is already paused.", true);
      return;
    }
    this._is_paused = true;
    logValue("Pausing cash collection.");
    this.biller.disableBiller();
  }

  async resume() {
    if (!this._is_paused) {
      logValue("resume() called when transection is already resumed.", true);
      return;
    }
    this._is_paused = false;
    logValue("Resuming cash collection.");
    await this.biller.enableBiller();
  }

  stop() {
    this.stop_thread = true;
    this.amount_requested = 0;
    this.request_id = 0;
    this._transaction_started = false;
    this._is_paused = true;
    try {
      this.biller.disableBiller();
    } catch (exp) {
      console.error(`Failed to disable, no biller found ${exp}`);
    }
  }

  cashAddedCallback(amount: number) {
    this.amount_collected += amount;
    logValue(
      `Collected amount: ${this.amount_collected}, Requested amount: ${this.amount_requested}`
    );
    let obj = {
      machineId: MACHINE_ID,
      requestId: this.request_id,
      billCollected: amount,
      uuid: uuidv1().toString().replace(/-/g, ""),
    };

    mqttInstance.publish(MQTT_TOPICS.BILL_RECEIVED, JSON.stringify(obj));
    if (this.amount_collected >= this.amount_requested) {
      this.stop_thread = true;
    }
  }

  _pollingTimeOutCallback(): void {
    this.stop_thread = true;
  }

  _collectionThread(): void {
    console.log(
      `Starting cash_collection_thread for amount: ${this.amount_requested}`
    );
    while (!this.stop_thread) {
      setTimeout(() => {}, 1000);
      continue;
    }

    // TODO: Do we need to send a reponse in case of time out or kiosk intentionally disabling collection

    let isSuccess = false;
    if (this.amount_collected >= this.amount_requested) {
      isSuccess = true;
    }

    const obj = {
      machineId: MACHINE_ID,
      requestId: this.request_id,
      totalCashRequested: this.amount_requested,
      totalCashCollected: this.amount_collected,
      didRequestTimedOut: isSuccess,
    };
    console.log(
      `Responding to broker with final response: ${JSON.stringify(obj)}`
    );
    mqttInstance.publish(MQTT_TOPICS.TOTAL_CASH_COLLECTED, JSON.stringify(obj));
    this.stop();
  }
}

interface IMqttMessage {
  requestId?: any;
  totalCashRequested?: any;
  command?: string;
  source?: string;
}

const mqttInitTopicHandler = (_topic: string, msg: string): void => {
  const message = JSON.parse(msg.toString());
  const totalCashRequested = message.totalCashRequested
    ? Number(message.totalCashRequested)
    : null;
  const requestId = message.requestId;

  const obj: IMqttMessage = {
    command: EVENTS.NEW_REQUEST,
    requestId: requestId,
    totalCashRequested: totalCashRequested,
    source: "mqtt",
  };

  logValue(
    `Recieved mqtt request( id: ${requestId} ) to collect cash( amount: ${totalCashRequested} ).`
  );
  queue_to_cash.push(obj);
};

const mqttDisableTopicHandler = (_topic: string, msg: string): void => {
  const message = JSON.parse(msg.toString());
  const requestId = message.requestId;

  logValue(
    `Recieved mqtt request( id: ${requestId} ) to stop cash collection.`
  );
  const obj: IMqttMessage = {
    command: EVENTS.DISABLE_CASH,
  };
  queue_to_cash.push(obj);
};

async function connectToMqtt(): Promise<void> {
  const cashCollector = new CashCollector();

  try {
    mqttInstance.startConnection();
    mqttInstance.subscribe(MQTT_TOPICS.INIT, mqttInitTopicHandler);
    mqttInstance.subscribe(MQTT_TOPICS.DISABLE, mqttDisableTopicHandler);

    if (cashCollector.is_transaction_pending) {
      cashCollector.resume();
    }

    while (mqttInstance.isConnected) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (cashCollector.is_transaction_pending) {
      cashCollector.pause();
    }

    logValue("Disconnected with broker! Reconnecting....", true);
    await connectToMqtt();
  } catch (error) {
    logValue(`Error occurred while connecting to MQTT: ${error}`, true);
  }
}

async function connectToCashMachine(): Promise<void> {
  const cashCollector = new CashCollector();

  while (true) {
    const obj: any = queue_to_cash.shift();
    logValue(`RECEIVED: ${JSON.stringify(obj)}`);
    if (obj.command === EVENTS.NEW_REQUEST) {
      if (cashCollector.is_transaction_pending) {
        logValue("Cancelling ongoing transaction...", true);
        cashCollector.stop();
      }
      logValue("_______________Starting new transaction_____________");
      cashCollector.start(obj.totalCashRequested, obj.requestId);
    }

    if (obj.command === EVENTS.DISABLE_CASH) {
      logValue("_______________Ending new transaction_____________");
      cashCollector.stop();
    }
  }
}

console.log("helloo")
const main = async () => {
  try {
    await connectToMqtt();
    await connectToCashMachine();
  } catch (error) {
    console.log(error);
  }
};

console.log("require main", require.main)
if (require.main === module) {
  
  main();
}
