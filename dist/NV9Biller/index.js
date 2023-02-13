"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const default_1 = __importDefault(require("../utils/config/default"));
const nv9biller_1 = require("./nv9biller");
const nv9biller_stub_1 = require("./nv9biller_stub");
const TEST_MODE = default_1.default.get("TEST_MODE");
let Biller;
if (TEST_MODE) {
    Biller = nv9biller_stub_1.Biller;
}
else {
    Biller = nv9biller_1.Biller;
}
exports.default = Biller;
