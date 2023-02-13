import config from "../utils/config/default";
import Biller from "../NV9Biller/index";
import { logValue } from "../utils/logger/logValue.utils";

const DEVICE = config.get<string>("DEVICE");
const TIMEOUT = config.get<string>("TIMEOUT");

class CustomBiller {
  biller: any | null = null;
  polling_thread: any = null;
  _polling_time = 0;
  cash_recieved_callback: (amount: number) => void;
  timeout_callback: () => void;
  _stop_polling = false;

  constructor(
    cash_recieved_callback: (amount: number) => void,
    timeout_callback: () => void
  ) {
    logValue("Initilizing NV9 biller");
    while (!this.biller) {
      logValue("Trying to initialize biller");
      try {
        this.biller = new Biller(DEVICE);
      } catch (exp) {
        logValue(`Failed to initialize biller, exception: ${exp}`, true);
        setTimeout(() => {}, 10 * 1000);
      }
    }
    this.cash_recieved_callback = cash_recieved_callback;
    this.timeout_callback = timeout_callback;
  }

  disableBiller() {
    logValue("Trying to disable polling");
    this._stop_polling = true;
    this.biller!.displayDisable();
    this.biller!.channelsSet(null);
    this.biller!.disable();
    logValue("Polling disabled");
  }

  async enableBiller(): Promise<boolean> {
    try {
      this.biller!.channelsSet(this.biller!.CH_ALL);
      this.biller!.displayEnable();
      this.biller!.enable();
      logValue("Biller Enabled, starting poll function...");
      this._polling_time = Date.now();
      this._stop_polling = false;
      await this.poll();
      return true;
    } catch (exp) {
      logValue(`Failed while enabling biller, exception: ${exp}`, true);
      return false;
    }
  }

  async poll() {
    logValue("Polling started");
    while (
      Date.now() <= this._polling_time + Number(TIMEOUT) &&
      !this._stop_polling
    ) {
      logValue("Biller waiting for cash");
      const events: any = this.biller?.poll();
      for (const event of events) {
        if (event === "-") {
          logValue(`Event skipped ${event}`);
        } else {
          logValue(`Event processing ${event}`);
          const typeInput = event.split(" ")[0];
          logValue(`Input type: ${typeInput}`);
          if (typeInput === "Credit") {
            const amount = Math.floor(parseFloat(event.split(" ")[2]));
            logValue(`Cash accepted for amount: ${amount}`);
            this.cash_recieved_callback(amount);
          }
        }
      }
    }

    if (this._stop_polling !== true) {
      logValue("Biller timeout, probably all the cash was not collected", true);
      this.timeout_callback();
    } else {
      logValue("Biller polling stopped");
    }
  }
}

export default CustomBiller;
