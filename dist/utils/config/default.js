"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logValue_utils_1 = require("../logger/logValue.utils");
class Config {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        dotenv_1.default.config();
        this._config = {
            MQTT: {
                mqttUrl: (_a = process.env.MQTT_BROKER_URL) !== null && _a !== void 0 ? _a : "",
                mqttUsername: (_b = process.env.MQTT_BROKER_USERNAME) !== null && _b !== void 0 ? _b : "",
                mqttPassword: (_c = process.env.MQTT_BROKER_PASSWORD) !== null && _c !== void 0 ? _c : "",
                mqttClient: (_d = `wendor-nv9-cash-${process.env.MACHINE_ID}-${Math.round(Date.now() / 1000)}`) !== null && _d !== void 0 ? _d : "",
                mqttConnectionTimeout: 4000,
                mqttReconnectPeriod: 1000,
                mqttPort: parseInt(process.env.MQTT_PORT),
            },
            MQTT_TOPICS: {
                INIT: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/INIT`,
                INIT_RESPONSE: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/INIT_RESPONSE`,
                DISABLE: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/DISABLE`,
                BILL_REJECTED: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/CASH_REJECTED`,
                BILL_RECEIVED: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/CASH_RECEIVED`,
                TOTAL_CASH_COLLECTED: `CASH/${process.env.MULTIVAC_VERSION}/${process.env.MACHINE_ID}/CASH_COLLECTION_COMPLETED`,
            },
            SOCKET_TOPICS: {
                welcome: "welcome",
                IDENTIFY: "IDENTIFY",
                CASH_INIT: "CASH_INIT",
                CASH_INIT_RESPONSE: "CASH_INIT_RESPONSE",
                CASH_DISABLE: "CASH_DISABLE",
                CASH_COMPLETION: "CASH_COMPLETION",
                CASH_RECEIVED: "CASH_RECEIVED",
                CASH_REJECTED: "CASH_REJECTED",
            },
            EVENTS: {
                CASH_COMPLETED: "CASH_COMPLETED",
                CASH_COLLECTED: "CASH_COLLECTED",
                NEW_REQUEST: "NEW_REQUEST",
                DISABLE_CASH: "DISABLE_CASH",
                PUBLISH_TO_MQTT: "PUBLISH_TO_MQTT",
                PUBLISH_TO_SOCKET: "PUBLISH_TO_SOCKET",
            },
            MULTIVAC_VERSION: (_e = process.env.MULTIVAC_VERSION) !== null && _e !== void 0 ? _e : "",
            MACHINE_ID: (_f = process.env.MACHINE_ID) !== null && _f !== void 0 ? _f : "",
            TIMEOUT: 360,
            SOCKET_URL: process.env.SOCKET_URL,
            LOG_API_URL: process.env.LOG_API_URL,
            TEST_MODE: process.env.TEST_MODE === "True",
            DEVICE: process.env.DEVICE_PORT || "/dev/wendor_cash_itl_direct",
        };
    }
    get(key) {
        var _a;
        const val = (_a = this._config[key]) !== null && _a !== void 0 ? _a : null;
        if (!val) {
            (0, logValue_utils_1.logValue)("Config for key [" + key + "] not found", true);
            throw new Error(`Config for key [${key}] not found`);
        }
        return val;
    }
    set(key, val) {
        this._config[key] = val;
    }
}
const config = new Config();
exports.default = config;
