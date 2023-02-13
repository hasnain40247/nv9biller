"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt = __importStar(require("mqtt"));
const default_1 = __importDefault(require("../utils/config/default"));
const logValue_utils_1 = require("../utils/logger/logValue.utils");
const MQTT = default_1.default.get("MQTT");
class MqttHandler {
    constructor() {
        this.isConnected = false;
        this.mqttClient = mqtt.connect(MQTT.mqttClient, {
            username: MQTT.mqttUsername,
            password: MQTT.mqttPassword,
        });
        this.callbackMap = {};
        this.mqttClient.on("connect", this.onConnect);
        this.mqttClient.on("message", this.onMessage);
        this.mqttClient.on("disconnect", this.onDisconnect);
    }
    subscribe(topic, callback, qos = 2) {
        if (!this.isConnected) {
            (0, logValue_utils_1.logValue)("Not connected to a broker before subscribing");
            return false;
        }
        (0, logValue_utils_1.logValue)(`Subscribing to topic: ${topic}`);
        this.mqttClient.subscribe(topic, { qos: qos }, (err) => {
            if (err) {
                (0, logValue_utils_1.logValue)(`Failed to subscribe to topic: ${topic}`);
                return false;
            }
        });
        this.callbackMap[topic] = callback;
        return true;
    }
    publish(topic, message, qos = 2) {
        if (!this.isConnected) {
            (0, logValue_utils_1.logValue)("Not connected to a broker before publishing", true);
            return false;
        }
        (0, logValue_utils_1.logValue)(`Publishing to topic: ${topic} :: message: ${message}`);
        this.mqttClient.publish(topic, message, { qos: qos }, (err) => {
            if (err) {
                (0, logValue_utils_1.logValue)("Failed to publish to topic: " + topic);
                return false;
            }
        });
        return true;
    }
    stopConnection() {
        if (!this.isConnected) {
            (0, logValue_utils_1.logValue)("Broker already disconnected before calling stopConnection()", true);
            return;
        }
        this.mqttClient.end();
    }
    startConnection() {
        if (this.isConnected) {
            (0, logValue_utils_1.logValue)("Broker already connected before calling startConnection()", true);
            return;
        }
        this.mqttClient.reconnect();
    }
    onMessage(topic, message) {
        (0, logValue_utils_1.logValue)("Received message for topic: " + topic);
        if (!(topic in this.callbackMap)) {
            (0, logValue_utils_1.logValue)("No callback for this topic! This message should have never been received", true);
            return;
        }
        this.callbackMap[topic](topic, message);
    }
    onConnect() {
        this.isConnected = true;
        (0, logValue_utils_1.logValue)("Connected to broker");
    }
    onDisconnect() {
        this.isConnected = false;
        (0, logValue_utils_1.logValue)(`Disconnect with broker.`);
    }
}
const mqttInstance = new MqttHandler();
exports.default = mqttInstance;
