"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logValue = void 0;
const logger_1 = __importDefault(require("./logger"));
const logValue = (data = "", error = false) => {
    if (error) {
        logger_1.default.error(data);
    }
    else {
        logger_1.default.info(data);
    }
};
exports.logValue = logValue;
