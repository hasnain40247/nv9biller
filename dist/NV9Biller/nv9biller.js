"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Biller = exports.BillerEvent = exports.BillerChannel = exports.BillerCommunicationsError = void 0;
const serialport_1 = require("serialport");
const python_struct_1 = require("python-struct");
const ssp = __importStar(require("./ssp"));
const crc16_1 = __importDefault(require("crc/crc16"));
class BillerCommunicationsError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.BillerCommunicationsError = BillerCommunicationsError;
class BillerChannel {
    constructor(value, currency) {
        this.value = value;
        this.currency = currency;
    }
    getValue() {
        return this.value;
    }
    getCurrency() {
        return this.currency;
    }
    toString() {
        return `${this.value.toFixed(2)} ${this.currency}`;
    }
}
exports.BillerChannel = BillerChannel;
class BillerEvent {
    constructor(code, channel) {
        this.code = code;
        this.channel = channel;
    }
    toString() {
        let result = `${BillerEvent.EVT_DESC[this.code]}`;
        if (this.channel) {
            result += ` -> ${this.channel}`;
        }
        return result;
    }
    getCode() {
        return this.code;
    }
    getChannel() {
        return this.channel;
    }
}
exports.BillerEvent = BillerEvent;
BillerEvent.EVT_DESC = {
    [ssp.EVT_RESET]: 'Reset',
    [ssp.EVT_READ]: 'Read',
    [ssp.EVT_CREDIT]: 'Credit',
    [ssp.EVT_REJECTING]: 'Rejecting',
    [ssp.EVT_REJECTED]: 'Rejected',
    [ssp.EVT_STACKING]: 'Stacking',
    [ssp.EVT_STACKED]: 'Stacked',
    [ssp.EVT_SAFE_JAM]: 'Safe jam',
    [ssp.EVT_UNSAFE_JAM]: 'Unsafe jam',
    [ssp.EVT_DISABLED]: 'Disabled',
    [ssp.EVT_STACKER_FULL]: 'Stacker full',
    [ssp.EVT_CLEARED_FRONT]: 'Cleared to front',
    [ssp.EVT_CLEARED_CASHBOX]: 'Cleared to cashbox',
    [ssp.EVT_CH_DISABLE]: 'Channels disabled',
    [ssp.EVT_INITIALIZING]: 'Initializing',
    [ssp.EVT_TICKET_BEZEL]: 'Ticket in bezel',
    [ssp.EVT_PRINTED_CASHBOX]: 'Printed to cashbox'
};
class Biller {
    constructor(port) {
        this._RX_STATE_WAIT_STX = 0;
        this._RX_STATE_WAIT_SEQ = 1;
        this._RX_STATE_WAIT_LEN = 2;
        this._RX_STATE_WAIT_DATA = 3;
        this._RX_STATE_WAIT_CRC = 4;
        this._RX_STATE_FINISHED = 5;
        this.CH_0 = 0;
        this.CH_1 = 1;
        this.CH_2 = 2;
        this.CH_3 = 3;
        this.CH_4 = 4;
        this.CH_5 = 5;
        this.CH_6 = 6;
        this.CH_7 = 7;
        this.CH_8 = 8;
        this.CH_9 = 9;
        this.CH_10 = 10;
        this.CH_11 = 11;
        this.CH_12 = 12;
        this.CH_13 = 13;
        this.CH_14 = 14;
        this.CH_15 = 15;
        this.CH_ALL = [
            this.CH_0,
            this.CH_1,
            this.CH_2,
            this.CH_3,
            this.CH_4,
            this.CH_5,
            this.CH_6,
            this.CH_7,
            this.CH_8,
            this.CH_9,
            this.CH_10,
            this.CH_11,
            this.CH_12,
            this.CH_13,
            this.CH_14,
            this.CH_15,
        ];
        this.EVT_RESET = ssp.EVT_ALL[0];
        this.EVT_READ = ssp.EVT_ALL[1];
        this.EVT_CREDIT = ssp.EVT_ALL[2];
        this.EVT_REJECTING = ssp.EVT_ALL[3];
        this.EVT_REJECTED = ssp.EVT_ALL[4];
        this.EVT_STACKING = ssp.EVT_ALL[5];
        this.EVT_STACKED = ssp.EVT_ALL[6];
        this.EVT_SAFE_JAM = ssp.EVT_ALL[7];
        this.EVT_UNSAFE_JAM = ssp.EVT_ALL[8];
        this.EVT_DISABLED = ssp.EVT_ALL[9];
        this.EVT_STACKER_FULL = ssp.EVT_ALL[10];
        this.EVT_CLEARED_FRONT = ssp.EVT_ALL[11];
        this.EVT_CLEARED_CASHBOX = ssp.EVT_ALL[12];
        this.EVT_CH_DISABLE = ssp.EVT_ALL[13];
        this.EVT_INITIALIZING = ssp.EVT_ALL[14];
        this.EVT_TICKET_BEZEL = ssp.EVT_ALL[15];
        this.EVT_PRINTED_CASHBOX = ssp.EVT_ALL[16];
        this._sequence = 0;
        this._channels = [];
        console.log("connecting");
        console.log(port);
        console.log(ssp.BAUDRATE);
        console.log(ssp.TIMEOUT);
        this._s = new serialport_1.SerialPort({ path: port, baudRate: ssp.BAUDRATE });
        console.log("connected -1");
        this._crc = crc16_1.default;
        this._sequence = 0;
        this._sync();
        this._load_settings();
    }
    _send(command, data = Buffer.alloc(0)) {
        const pkt = Buffer.concat([
            Buffer.from([this._sequence, 1 + data.length, command]),
            data,
        ]);
        const crcValue = this._crc(pkt);
        const pktWithCRC = Buffer.concat([
            pkt,
            Buffer.from([crcValue & 0xff, (crcValue >> 8) & 0xff]),
        ]);
        const stx = Buffer.from([ssp.STX]);
        const stxDouble = Buffer.concat([stx, stx]);
        const pktWithSTX = Buffer.concat([
            stx,
            ...pktWithCRC.reduce((acc, curr, idx, src) => {
                if (curr === stx[0]) {
                    acc.push(stxDouble);
                }
                else {
                    acc.push(Buffer.from([curr]));
                }
                return acc;
            }, []),
        ]);
        this._s.write(pktWithSTX);
    }
    _transmit(command, data = new Uint8Array()) {
        this._send(command, data);
        let r = this._recv();
        this._sequence ^= ssp.SEQ;
        return r;
    }
    _sync() {
        this._transmit(ssp.CMD_SYNC);
        this._sequence = 0;
    }
    _load_settings() {
        // request serial
        const r = this._transmit(ssp.CMD_GET_SERIAL);
        this._serial = (0, python_struct_1.unpack)(">I", Buffer.from(r))[0];
        // request setup
        const s = this._transmit(ssp.CMD_SETUP_REQ);
        this._fw_version = s.slice(1, 1 + 4).toString();
        // process each channel information
        const n_ch = s[11];
        const multiplier = (0, python_struct_1.unpack)(">I", Buffer.from("\x00" + s.slice(8, 8 + 3)))[0];
        this._channels = [];
        for (let ch = 0; ch < n_ch; ch++) {
            let off = 12 + ch;
            const value = s[off] * multiplier;
            off = 16 + n_ch * 2 + ch * 3;
            const currency = s.slice(off, off + 3).toString();
            this._channels.push(new BillerChannel(value, currency));
        }
    }
    get serial() {
        return this._serial;
    }
    get fw_version() {
        return this._fw_version;
    }
    get channels() {
        return this._channels;
    }
    get counters() {
        const r = this._transmit(ssp.CMD_COUNTERS_GET);
        return {
            stacked: (0, python_struct_1.unpack)("<I", Buffer.from(r.slice(1, 1 + 4)))[0],
            stored: (0, python_struct_1.unpack)("<I", Buffer.from(r.slice(5, 5 + 4)))[0],
            dispensed: (0, python_struct_1.unpack)("<I", Buffer.from(r.slice(9, 9 + 4)))[0],
            transferred: (0, python_struct_1.unpack)("<I", Buffer.from(r.slice(13, 13 + 4)))[0],
            rejected: (0, python_struct_1.unpack)("<I", Buffer.from(r.slice(17, 17 + 4)))[0],
        };
    }
    counters_reset() {
        /** Reset counters. */
        this._transmit(ssp.CMD_COUNTERS_RST);
    }
    display_enable() {
        /** Enable display (leds). */
        this._transmit(ssp.CMD_DISP_EN);
    }
    _recv() {
        let pkt = Buffer.from([]);
        let pktCounter = 0;
        let state = this._RX_STATE_WAIT_STX;
        let init = Date.now();
        while (state !== this._RX_STATE_FINISHED) {
            if (Date.now() - init > ssp.TIMEOUT) {
                throw new BillerCommunicationsError("Timeout");
            }
            const data = this._s.read();
            if (!data) {
                continue;
            }
            // wait until STX
            if (state === this._RX_STATE_WAIT_STX) {
                if (data.readUInt8(0) === ssp.STX) {
                    state = this._RX_STATE_WAIT_SEQ;
                }
            }
            else {
                // skip stuffed bytes
                if (data.readUInt8(0) === ssp.STX) {
                    continue;
                }
                pkt = Buffer.concat([pkt, data]);
                let pktLen = 0;
                // process state
                if (state === this._RX_STATE_WAIT_SEQ) {
                    state = this._RX_STATE_WAIT_LEN;
                }
                else if (state === this._RX_STATE_WAIT_LEN) {
                    pktLen = data.readUInt8(0);
                    state = this._RX_STATE_WAIT_DATA;
                }
                else if (state === this._RX_STATE_WAIT_DATA) {
                    pktCounter += 1;
                    if (pktCounter === pktLen) {
                        pktCounter = 0;
                        state = this._RX_STATE_WAIT_CRC;
                    }
                }
                else if (state === this._RX_STATE_WAIT_CRC) {
                    pktCounter += 1;
                    if (pktCounter === ssp.CRC_LEN) {
                        state = this._RX_STATE_FINISHED;
                    }
                }
            }
        }
        // validate CRC
        let crc = this._crc(pkt.slice(0, -ssp.CRC_LEN));
        if (crc !== pkt.readUInt16LE(pkt.length - ssp.CRC_LEN)) {
            throw new BillerCommunicationsError("CRC mismatch");
        }
        // check for response errors
        let err = pkt[ssp.RESP_FLD];
        if (err !== ssp.ERR_OK) {
            throw new BillerCommunicationsError(ssp.ERR_DESC[err]);
        }
        return pkt.slice(ssp.RESP_FLD + 1, -ssp.CRC_LEN);
    }
}
exports.Biller = Biller;
