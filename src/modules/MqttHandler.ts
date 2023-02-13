import * as mqtt from "mqtt";
import config from "../utils/config/default";
import { I_MQTT } from "../interfaces/mqtt.interfaces";
import { logValue } from "../utils/logger/logValue.utils";
const MQTT = config.get<I_MQTT>("MQTT");

class MqttHandler {
  isConnected: boolean = false;
  mqttClient = mqtt.connect(MQTT.mqttClient, {
    username: MQTT.mqttUsername,
    password: MQTT.mqttPassword,
  });
  callbackMap: {
    [key: string]: (topic: string, message: string) => void;
  } = {};

  constructor() {
    this.mqttClient.on("connect", this.onConnect);
    this.mqttClient.on("message", this.onMessage);
    this.mqttClient.on("disconnect", this.onDisconnect);
  }

  subscribe(
    topic: string,
    callback: (topic: string, message: string) => void,
    qos: mqtt.QoS = 2
  ): boolean {
    if (!this.isConnected) {
      logValue("Not connected to a broker before subscribing");
      return false;
    }

    logValue(`Subscribing to topic: ${topic}`);
    this.mqttClient.subscribe(topic, { qos: qos }, (err) => {
      if (err) {
        logValue(`Failed to subscribe to topic: ${topic}`);
        return false;
      }
    });

    this.callbackMap[topic] = callback;
    return true;
  }

  publish(topic: string, message: string, qos: mqtt.QoS = 2): boolean {
    if (!this.isConnected) {
      logValue("Not connected to a broker before publishing",true);
      return false;
    }
    logValue(`Publishing to topic: ${topic} :: message: ${message}`);
    this.mqttClient.publish(topic, message, { qos: qos }, (err) => {
      if (err) {
        logValue("Failed to publish to topic: " + topic);
        return false;
      }
    });
    return true;
  }

  stopConnection(): void {
    if (!this.isConnected) {
      logValue(
        "Broker already disconnected before calling stopConnection()",true
      );
      return;
    }
    this.mqttClient.end();
  }

  startConnection() {
    if (this.isConnected) {
      logValue(
        "Broker already connected before calling startConnection()",
        true
      );
      return;
    }
    this.mqttClient.reconnect();
  }

  onMessage(topic: string, message: string): void {
    logValue("Received message for topic: " + topic);
    if (!(topic in this.callbackMap)) {
      logValue(
        "No callback for this topic! This message should have never been received",
        true
      );
      return;
    }
    this.callbackMap[topic](topic, message);
  }

  onConnect(): void {
    this.isConnected = true;
    logValue("Connected to broker");
  }

  onDisconnect(): void {
    this.isConnected = false;

    logValue(`Disconnect with broker.`);
  }
}

const mqttInstance = new MqttHandler();
export default mqttInstance;
