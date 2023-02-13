interface I_MQTT {
  mqttUrl: string;
  mqttUsername: string;
  mqttPassword: string;
  mqttClient: string;
  mqttConnectionTimeout: number;
  mqttReconnectPeriod: number;
  mqttPort: number;
}

interface I_MQTT_EVENTS {
  CASH_COMPLETED: string;
  CASH_COLLECTED: string;
  NEW_REQUEST: string;
  DISABLE_CASH: string;
  PUBLISH_TO_MQTT: string;
  PUBLISH_TO_SOCKET: string;
}

interface I_MQTT_TOPICS {
  [key: string]: string;
  INIT: string;
  INIT_RESPONSE: string;
  DISABLE: string;
  BILL_REJECTED: string;
  BILL_RECEIVED: string;
  TOTAL_CASH_COLLECTED: string;
}

export { I_MQTT, I_MQTT_TOPICS,I_MQTT_EVENTS };
