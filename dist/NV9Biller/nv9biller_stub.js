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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Biller = void 0;
const logValue_utils_1 = require("../utils/logger/logValue.utils");
class Biller {
    constructor(port) {
        this.port = port;
        this.serial = 9211;
        this.CH_ALL = -1;
        (0, logValue_utils_1.logValue)("Biller_STUB: Inintilizing Biller Stub module");
        (0, logValue_utils_1.logValue)(`Biller_STUB: Port ${port}`);
    }
    enable() {
        (0, logValue_utils_1.logValue)("Biller_STUB: enable called");
    }
    disable() {
        (0, logValue_utils_1.logValue)("Biller_STUB: disable called");
    }
    poll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((f) => setTimeout(f, 5000));
            (0, logValue_utils_1.logValue)("Biller_STUB: poll called");
            return ["Credit = 5.00"]; //dummy return statement
        });
    }
    display_disable() {
        (0, logValue_utils_1.logValue)("Biller_STUB:  display_disable called");
    }
    display_enable() {
        (0, logValue_utils_1.logValue)("Biller_STUB:  display_enable called");
    }
    channels_set(arg) {
        (0, logValue_utils_1.logValue)(`Biller_STUB:  channels_set called with args ${arg}`);
    }
}
exports.Biller = Biller;
