"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logValue_utils_1 = require("./utils/logger/logValue.utils");
const default_1 = __importDefault(require("./utils/config/default"));
const uuid_1 = require("uuid");
const MqttHandler_1 = __importDefault(require("./modules/MqttHandler"));
const CustomBiller_1 = __importDefault(require("./modules/CustomBiller"));
const MQTT_TOPICS = default_1.default.get("MQTT_TOPICS");
const MACHINE_ID = default_1.default.get("MACHINE_ID");
const EVENTS = default_1.default.get("EVENTS");
let queue_to_cash = [];
class CashCollector {
    constructor() {
        this.amount_requested = 0;
        this.amount_collected = 0;
        this.request_id = 0;
        this.stop_thread = true;
        this._transaction_started = false;
        this._is_paused = true;
        this.biller = new CustomBiller_1.default(this.cashAddedCallback, this._pollingTimeOutCallback);
    }
    get is_transaction_pending() {
        return this._transaction_started;
    }
    start(amount_requested, request_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = yield this.biller.enableBiller();
            if (!status) {
                (0, logValue_utils_1.logValue)("Failed to enable biller", true);
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
            MqttHandler_1.default.publish(MQTT_TOPICS.INIT_RESPONSE, init_response_stringified);
            this.amount_collected = 0;
            this.stop_thread = false;
            this._transaction_started = true;
            this._is_paused = false;
            this.amount_requested = amount_requested;
            this.request_id = request_id;
            setTimeout(() => this._collectionThread(), 0);
            return true;
        });
    }
    pause() {
        if (this._is_paused) {
            (0, logValue_utils_1.logValue)("pause() called when transection is already paused.", true);
            return;
        }
        this._is_paused = true;
        (0, logValue_utils_1.logValue)("Pausing cash collection.");
        this.biller.disableBiller();
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._is_paused) {
                (0, logValue_utils_1.logValue)("resume() called when transection is already resumed.", true);
                return;
            }
            this._is_paused = false;
            (0, logValue_utils_1.logValue)("Resuming cash collection.");
            yield this.biller.enableBiller();
        });
    }
    stop() {
        this.stop_thread = true;
        this.amount_requested = 0;
        this.request_id = 0;
        this._transaction_started = false;
        this._is_paused = true;
        try {
            this.biller.disableBiller();
        }
        catch (exp) {
            console.error(`Failed to disable, no biller found ${exp}`);
        }
    }
    cashAddedCallback(amount) {
        this.amount_collected += amount;
        (0, logValue_utils_1.logValue)(`Collected amount: ${this.amount_collected}, Requested amount: ${this.amount_requested}`);
        let obj = {
            machineId: MACHINE_ID,
            requestId: this.request_id,
            billCollected: amount,
            uuid: (0, uuid_1.v1)().toString().replace(/-/g, ""),
        };
        MqttHandler_1.default.publish(MQTT_TOPICS.BILL_RECEIVED, JSON.stringify(obj));
        if (this.amount_collected >= this.amount_requested) {
            this.stop_thread = true;
        }
    }
    _pollingTimeOutCallback() {
        this.stop_thread = true;
    }
    _collectionThread() {
        console.log(`Starting cash_collection_thread for amount: ${this.amount_requested}`);
        while (!this.stop_thread) {
            setTimeout(() => { }, 1000);
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
        console.log(`Responding to broker with final response: ${JSON.stringify(obj)}`);
        MqttHandler_1.default.publish(MQTT_TOPICS.TOTAL_CASH_COLLECTED, JSON.stringify(obj));
        this.stop();
    }
}
const mqttInitTopicHandler = (_topic, msg) => {
    const message = JSON.parse(msg.toString());
    const totalCashRequested = message.totalCashRequested
        ? Number(message.totalCashRequested)
        : null;
    const requestId = message.requestId;
    const obj = {
        command: EVENTS.NEW_REQUEST,
        requestId: requestId,
        totalCashRequested: totalCashRequested,
        source: "mqtt",
    };
    (0, logValue_utils_1.logValue)(`Recieved mqtt request( id: ${requestId} ) to collect cash( amount: ${totalCashRequested} ).`);
    queue_to_cash.push(obj);
};
const mqttDisableTopicHandler = (_topic, msg) => {
    const message = JSON.parse(msg.toString());
    const requestId = message.requestId;
    (0, logValue_utils_1.logValue)(`Recieved mqtt request( id: ${requestId} ) to stop cash collection.`);
    const obj = {
        command: EVENTS.DISABLE_CASH,
    };
    queue_to_cash.push(obj);
};
function connectToMqtt() {
    return __awaiter(this, void 0, void 0, function* () {
        const cashCollector = new CashCollector();
        try {
            MqttHandler_1.default.startConnection();
            MqttHandler_1.default.subscribe(MQTT_TOPICS.INIT, mqttInitTopicHandler);
            MqttHandler_1.default.subscribe(MQTT_TOPICS.DISABLE, mqttDisableTopicHandler);
            if (cashCollector.is_transaction_pending) {
                cashCollector.resume();
            }
            while (MqttHandler_1.default.isConnected) {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
            }
            if (cashCollector.is_transaction_pending) {
                cashCollector.pause();
            }
            (0, logValue_utils_1.logValue)("Disconnected with broker! Reconnecting....", true);
            yield connectToMqtt();
        }
        catch (error) {
            (0, logValue_utils_1.logValue)(`Error occurred while connecting to MQTT: ${error}`, true);
        }
    });
}
function connectToCashMachine() {
    return __awaiter(this, void 0, void 0, function* () {
        const cashCollector = new CashCollector();
        while (true) {
            const obj = queue_to_cash.shift();
            (0, logValue_utils_1.logValue)(`RECEIVED: ${JSON.stringify(obj)}`);
            if (obj.command === EVENTS.NEW_REQUEST) {
                if (cashCollector.is_transaction_pending) {
                    (0, logValue_utils_1.logValue)("Cancelling ongoing transaction...", true);
                    cashCollector.stop();
                }
                (0, logValue_utils_1.logValue)("_______________Starting new transaction_____________");
                cashCollector.start(obj.totalCashRequested, obj.requestId);
            }
            if (obj.command === EVENTS.DISABLE_CASH) {
                (0, logValue_utils_1.logValue)("_______________Ending new transaction_____________");
                cashCollector.stop();
            }
        }
    });
}
console.log("helloo");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectToMqtt();
        yield connectToCashMachine();
    }
    catch (error) {
        console.log(error);
    }
});
console.log("require main", require.main);
if (require.main === module) {
    main();
}
