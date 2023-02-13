import env from "dotenv";
import { logValue } from "../logger/logValue.utils";

class Config {
  _config: Record<string, any>;
  constructor() {
    env.config();
    this._config = {
      MQTT: {
        mqttUrl: process.env.MQTT_BROKER_URL ?? "",
        mqttUsername: process.env.MQTT_BROKER_USERNAME ?? "",
        mqttPassword: process.env.MQTT_BROKER_PASSWORD ?? "",
        mqttClient:
          `wendor-nv9-cash-${process.env.MACHINE_ID}-${Math.round(
            Date.now() / 1000
          )}` ?? "",
        mqttConnectionTimeout: 4000,
        mqttReconnectPeriod: 1000,
        mqttPort: parseInt(process.env.MQTT_PORT as string),
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
      MULTIVAC_VERSION: process.env.MULTIVAC_VERSION ?? "",
      MACHINE_ID: process.env.MACHINE_ID ?? "",
      TIMEOUT: 360,
      SOCKET_URL: process.env.SOCKET_URL,
      LOG_API_URL: process.env.LOG_API_URL,

      TEST_MODE: process.env.TEST_MODE === "True",
      DEVICE: process.env.DEVICE_PORT || "/dev/wendor_cash_itl_direct",
    };
  }

  get<Type>(key: string): Type {
    const val: Type | null = this._config[key] ?? null;

    if (!val) {
      logValue("Config for key [" + key + "] not found", true);
      throw new Error(`Config for key [${key}] not found`);
    }

    return val;
  }
  set(key: string, val: any): void {
    this._config[key] = val;
  }
}

const config = new Config();

export default config;
