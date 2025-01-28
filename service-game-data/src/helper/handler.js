import { CompletionServices } from '../services/Completion.js';
import { Logger } from '../services/Logger.js';

const completion = new CompletionServices();
const logger = new Logger();

/**
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Function} func: module function to be used
 */
export async function requestHandler(request, response, func) {
  try {
    let res = await func(request);
    completion.sendOkResponse(request, response, res);
  }
  catch(err) {
    logger.error(err);
    completion.sendFailResponse(request, response, completion.completionCodes.UNKNOWN_ERROR);
  }
}
