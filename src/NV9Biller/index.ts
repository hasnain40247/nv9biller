import config from "../utils/config/default";
import { Biller as nv9Biller } from "./nv9biller";
import { Biller as nv9BillerStub } from "./nv9biller_stub";

const TEST_MODE = config.get("TEST_MODE");
let Biller: any;
if (TEST_MODE) {
  Biller = nv9BillerStub;
} else {
  Biller = nv9Biller;
}

export default Biller;
