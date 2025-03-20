import { CompletionServices } from '../services/Completion.js';
import { Logger } from '../services/Logger.js';
import { SqlDB } from '../services/SqlDB.js';

const logger = new Logger();
const completion = new CompletionServices();
const sqlDB = new SqlDB();

/**
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Function} func: module function to be used
 */
export async function requestHandler(request, response, func, withSql = false) {
  logger.info(`---> requestHandler(${withSql})`);
  try {
    let res = await (withSql ? sqlDbTransactionWrapper(request, func) : func(request));
    if (res) completion.sendOkResponse(request, response, res);
  }
  catch(err) {
    console.log(err);
    logger.error(err);
    if (completion.completionCodes.hasOwnProperty(err)) {

    }
    else {
     completion.sendFailResponse(request, response, completion.completionCodes.UNKNOWN_ERROR);
    }
  }
}

/**
 * Wraps the handler function to an SQL Transaction.
 * @param {*} request
 * @param {*} func
 */
async function sqlDbTransactionWrapper(request, func) {
  logger.info(`---> sqlDbTransactionWrapper()`);
  try {
    await sqlDB.connect();
    await sqlDB.beginTransaction(request);
    let res = await func(request);
    await sqlDB.commitTransaction(request);
    return res;
  }
  catch(err) {
    await sqlDB.rollbackTransaction();
    throw new Error(err);
  }
}
