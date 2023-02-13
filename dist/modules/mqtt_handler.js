"use strict";
class MqttHandler {
    constructor() {
        this.isConnected = false;
        this.mqttClient = paho.Client(client_id, constants.MQTT_CLIENT_ID);
        this.callbackMap = {};
        this.mqttClient.username_pw_set(username, constants.MQTT_BROKER_USERNAME, password, constants.MQTT_BROKER_PASSWORD);
        this.mqttClient.on_message = this.onMessage;
        this.mqttClient.on_connect = this.onConnect;
        this.mqttClient.on_disconnect = this.onDisconnect;
    }
    subscribe(topic, callback, qos = 2) {
        if (!this.isConnected) {
            mqtt_logger.error("Not connected to a broker before subscribing");
            return false;
        }
        mqtt_logger.info(`Subscribing to topic: ${topic}`);
        const [result, _] = this.mqttClient.subscribe(topic, qos);
        if (result !== paho.MQTT_ERR_SUCCESS) {
            mqtt_logger.info(`Failed to subscribe to topic: ${topic}`);
            return false;
        }
        this.callbackMap[topic] = callback;
        return true;
    }
    publish(topic, message, qos = 2) {
        if (!this.is_connected) {
            mqtt_logger.error("Not connected to a broker before publishing");
            return false;
        }
        mqtt_logger.info("Publishing to topic: %s :: message: %s", topic, message);
        const [result, _] = this.mqtt_client.publish(topic, message, qos);
        if (result !== paho.MQTT_ERR_SUCCESS) {
            mqtt_logger.info("Failed to publish to topic: " + topic);
            return false;
        }
        return true;
    }
    stopConnection() {
        if (!this.isConnected) {
            mqtt_logger.warning("Broker already disconnected before calling stopConnection()");
            return;
        }
        this.mqtt_client.loop_stop();
        this.mqtt_client.disconnect();
    }
    start_connection() {
        if (this.is_connected) {
            mqtt_logger.warning("Broker already connected before calling start_connection()");
            return;
        }
        while (!this.is_connected) {
            try {
                mqtt_logger.info("Trying to connect to Broker");
                this.mqtt_client.connect(constants.MQTT_BROKER_URL, { port: constants.MQTT_PORT, keepalive: 10 });
                this.mqtt_client.loop_start();
                // wait for a bit to connect 
                setTimeout(() => { }, 1000);
            }
            catch (exp) {
                mqtt_logger.error("Failed to connect to the broker, retrying....");
                mqtt_logger.error(exp);
                setTimeout(() => { }, 1000);
                continue;
            }
        }
    }
    onMessage(_client, _obj, msg) {
        console.log("Received message for topic: " + msg.topic);
        let topic = msg.topic;
        let message = msg.payload;
        if (!(topic in this.callbackMap)) {
            console.error("No callback for this topic! This message should have never been received");
            return;
        }
        // call the respective callback
        this.callbackMap[topic](topic, message);
    }
    onConnect(_client, _userdata, _flags, ret_code) {
        if (ret_code === 0) {
            this.isConnected = true;
            mqtt_logger.info("Connected to broker");
        }
        else {
            mqtt_logger.info(`Failed to connect with broker with return code ${ret_code}`);
        }
    }
    onDisconnect(client, userData, retCode) {
        this.isConnected = false;
        if (retCode !== 0) {
            mqttLogger.info(`Disconnect with broker with error code: ${retCode}`);
        }
        else {
            mqttLogger.info("Disconnect with broker");
        }
    }
}
