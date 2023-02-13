"use strict";
class CustomBiller {
    constructor(cash_recieved_callback, timeout_callback) {
        biller_logger.info("Initializing NV9 biller");
        this.biller = null;
        while (this.biller === null) {
            biller_logger.info("Trying to initialize biller");
            try {
                this.biller = Biller(constants.DEVICE);
            }
            catch (exp) {
                biller_logger.error(`Failed to initialize biller, exception: ${exp}`);
                time.sleep(10);
            }
        }
        this.pollingThread = null;
        this._pollingTime = 0;
        this.cashRecievedCallback = cash_recieved_callback;
        this.timeoutCallback = timeout_callback;
        this._stopPolling = false;
    }
    disableBiller() {
        biller_logger.info("Trying to disable polling");
        this._stopPolling = true;
        this.biller.display_disable();
        this.biller.channels_set(null);
        this.biller.disable();
        biller_logger.info("Polling disabled");
    }
    enable_biller() {
        try {
            this.biller.channels_set(this.biller.CH_ALL);
            this.biller.display_enable();
            this.biller.enable();
            console.log("Biller Enabled, starting poll thread...");
            this._polling_time = Date.now();
            this._stop_polling = false;
            this.polling_thread = setInterval(() => this.poll(), 0);
            return true;
        }
        catch (exp) {
            console.error("Failed while enabling biller, exception: " + exp);
            return false;
        }
    }
}
