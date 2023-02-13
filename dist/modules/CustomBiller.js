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
const default_1 = __importDefault(require("../utils/config/default"));
const index_1 = __importDefault(require("../NV9Biller/index"));
const logValue_utils_1 = require("../utils/logger/logValue.utils");
const DEVICE = default_1.default.get("DEVICE");
const TIMEOUT = default_1.default.get("TIMEOUT");
class CustomBiller {
    constructor(cash_recieved_callback, timeout_callback) {
        this.biller = null;
        this.polling_thread = null;
        this._polling_time = 0;
        this._stop_polling = false;
        (0, logValue_utils_1.logValue)("Initilizing NV9 biller");
        while (!this.biller) {
            (0, logValue_utils_1.logValue)("Trying to initialize biller");
            try {
                this.biller = new index_1.default(DEVICE);
            }
            catch (exp) {
                (0, logValue_utils_1.logValue)(`Failed to initialize biller, exception: ${exp}`, true);
                setTimeout(() => { }, 10 * 1000);
            }
        }
        this.cash_recieved_callback = cash_recieved_callback;
        this.timeout_callback = timeout_callback;
    }
    disableBiller() {
        (0, logValue_utils_1.logValue)("Trying to disable polling");
        this._stop_polling = true;
        this.biller.displayDisable();
        this.biller.channelsSet(null);
        this.biller.disable();
        (0, logValue_utils_1.logValue)("Polling disabled");
    }
    enableBiller() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.biller.channelsSet(this.biller.CH_ALL);
                this.biller.displayEnable();
                this.biller.enable();
                (0, logValue_utils_1.logValue)("Biller Enabled, starting poll function...");
                this._polling_time = Date.now();
                this._stop_polling = false;
                yield this.poll();
                return true;
            }
            catch (exp) {
                (0, logValue_utils_1.logValue)(`Failed while enabling biller, exception: ${exp}`, true);
                return false;
            }
        });
    }
    poll() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (0, logValue_utils_1.logValue)("Polling started");
            while (Date.now() <= this._polling_time + Number(TIMEOUT) &&
                !this._stop_polling) {
                (0, logValue_utils_1.logValue)("Biller waiting for cash");
                const events = (_a = this.biller) === null || _a === void 0 ? void 0 : _a.poll();
                for (const event of events) {
                    if (event === "-") {
                        (0, logValue_utils_1.logValue)(`Event skipped ${event}`);
                    }
                    else {
                        (0, logValue_utils_1.logValue)(`Event processing ${event}`);
                        const typeInput = event.split(" ")[0];
                        (0, logValue_utils_1.logValue)(`Input type: ${typeInput}`);
                        if (typeInput === "Credit") {
                            const amount = Math.floor(parseFloat(event.split(" ")[2]));
                            (0, logValue_utils_1.logValue)(`Cash accepted for amount: ${amount}`);
                            this.cash_recieved_callback(amount);
                        }
                    }
                }
            }
            if (this._stop_polling !== true) {
                (0, logValue_utils_1.logValue)("Biller timeout, probably all the cash was not collected", true);
                this.timeout_callback();
            }
            else {
                (0, logValue_utils_1.logValue)("Biller polling stopped");
            }
        });
    }
}
exports.default = CustomBiller;
