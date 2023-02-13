"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVT_ALL = exports.CMD_COUNTERS_RST = exports.CMD_COUNTERS_GET = exports.CMD_HOLD = exports.CMD_SYNC = exports.CMD_GET_SERIAL = exports.CMD_ENABLE = exports.CMD_DISABLE = exports.CMD_REJECT = exports.CMD_POLL = exports.CMD_SETUP_REQ = exports.CMD_DISP_DIS = exports.CMD_DISP_EN = exports.CMD_CH_INHIBITS = exports.EVT_PRINTED_CASHBOX = exports.EVT_TICKET_BEZEL = exports.EVT_INITIALIZING = exports.EVT_CH_DISABLE = exports.EVT_CLEARED_CASHBOX = exports.EVT_CLEARED_FRONT = exports.EVT_STACKER_FULL = exports.EVT_DISABLED = exports.EVT_UNSAFE_JAM = exports.EVT_SAFE_JAM = exports.EVT_STACKED = exports.EVT_STACKING = exports.EVT_REJECTED = exports.EVT_REJECTING = exports.EVT_CREDIT = exports.EVT_READ = exports.EVT_RESET = exports.ERR_DESC = exports.ERR_KEY = exports.ERR_FAIL = exports.ERR_SW = exports.ERR_PROCESS = exports.ERR_RANGE = exports.ERR_NOPARAM = exports.ERR_NOTKNOWN = exports.ERR_OK = exports.RESP_FLD = exports.SEQ = exports.STX = exports.CRC_LEN = exports.CRC_INIT = exports.CRC_POLY = exports.TIMEOUT = exports.BAUDRATE = void 0;
exports.BAUDRATE = 9600;
/** int: Baudrate (bps). */
exports.TIMEOUT = 1;
/** int: Timeout (s). */
exports.CRC_POLY = 0x18005;
/** int: CRC polynomial (CRC16-IBM). */
exports.CRC_INIT = 0xFFFF;
/** int: CRC initialization value. */
exports.CRC_LEN = 2;
/** int: CRC length (bytes). */
exports.STX = 0x7F;
/** int: STX (start) byte value. */
exports.SEQ = 0x80;
/** int: Sequence flag. */
exports.RESP_FLD = 2;
/** int: Response code byte in the response. */
exports.ERR_OK = 0xF0;
/** int: Error code, OK. */
exports.ERR_NOTKNOWN = 0xF2;
/** int: Error code, command not known. */
exports.ERR_NOPARAM = 0xF3;
/** int: Error code, incorrect number of parameters. */
exports.ERR_RANGE = 0xF4;
/** int: Error code, one of the parameters is out of range. */
exports.ERR_PROCESS = 0xF5;
/** int: Error code, command could not be processed. */
exports.ERR_SW = 0xF6;
/** int: Error code, software error. */
exports.ERR_FAIL = 0xF8;
/** int: Error code, general failure. */
exports.ERR_KEY = 0xFA;
/** int: Error code, encryption keys not negotiated. */
exports.ERR_DESC = {
    [exports.ERR_NOTKNOWN]: 'Command not known',
    [exports.ERR_NOPARAM]: 'Incorrect number of parameters',
    [exports.ERR_RANGE]: 'One of the parameters is out of range',
    [exports.ERR_PROCESS]: 'Command could not be processed',
    [exports.ERR_SW]: 'Software error',
    [exports.ERR_FAIL]: 'General failure',
    [exports.ERR_KEY]: 'Encryption keys not negotiated'
};
/** dict: Error codes descriptions. */
exports.EVT_RESET = 0xF1;
exports.EVT_READ = 0xEF;
exports.EVT_CREDIT = 0xEE;
exports.EVT_REJECTING = 0xED;
exports.EVT_REJECTED = 0xEC;
exports.EVT_STACKING = 0xCC;
exports.EVT_STACKED = 0xEB;
exports.EVT_SAFE_JAM = 0xEA;
exports.EVT_UNSAFE_JAM = 0xE9;
exports.EVT_DISABLED = 0xE8;
exports.EVT_STACKER_FULL = 0xE7;
exports.EVT_CLEARED_FRONT = 0xE1;
exports.EVT_CLEARED_CASHBOX = 0xE2;
exports.EVT_CH_DISABLE = 0xB5;
exports.EVT_INITIALIZING = 0xB6;
exports.EVT_TICKET_BEZEL = 0xAD;
exports.EVT_PRINTED_CASHBOX = 0xAF;
exports.CMD_CH_INHIBITS = 0x02;
/** int: Command, channel inhibits. */
exports.CMD_DISP_EN = 0x03;
/** int: Command, display enable. */
exports.CMD_DISP_DIS = 0x04;
/** int: Command, display disable. */
exports.CMD_SETUP_REQ = 0x05;
/** int: Command, setup request. */
exports.CMD_POLL = 0x07;
/** int: Command, poll. */
exports.CMD_REJECT = 0x08;
/** int: Command, reject. */
exports.CMD_DISABLE = 0x09;
/** int: Command, disable. */
exports.CMD_ENABLE = 0x0A;
/** int: Command, enable. */
exports.CMD_GET_SERIAL = 0x0C;
/** int: Command, get serial. */
exports.CMD_SYNC = 0x11;
/** int: Command, sync. */
exports.CMD_HOLD = 0x18;
/** int: Command, hold. */
exports.CMD_COUNTERS_GET = 0x58;
/** int: Command, counters get. */
exports.CMD_COUNTERS_RST = 0x59;
/** int: Command, counters reset. */
exports.EVT_ALL = [exports.EVT_RESET, exports.EVT_READ, exports.EVT_CREDIT, exports.EVT_REJECTING, exports.EVT_REJECTED,
    exports.EVT_STACKING, exports.EVT_STACKED, exports.EVT_SAFE_JAM, exports.EVT_UNSAFE_JAM,
    exports.EVT_DISABLED, exports.EVT_STACKER_FULL, exports.EVT_CLEARED_FRONT,
    exports.EVT_CLEARED_CASHBOX, exports.EVT_CH_DISABLE, exports.EVT_INITIALIZING,
    exports.EVT_TICKET_BEZEL, exports.EVT_PRINTED_CASHBOX];
/** tuple: All events. */ 
