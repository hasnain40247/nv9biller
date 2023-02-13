import logger from "./logger";


export const logValue = (data: string = "", error = false) => {
  if (error) {
    logger.error(data);
  } else {
    logger.info(data);
  }
};
