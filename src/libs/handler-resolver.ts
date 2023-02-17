/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This function extracts the function's file path from the directory filename passed as
 * parameter. It should be called with the `__dirname`.
 *
 * @see src/functions/create/index.ts#12
 * @example
 * const hPath = handlerPath(__dirname)
 * // The parameter __dirname would be like /swap-server/hathor-atomic-swap-service/src/functions/create
 * // process.cwd() would be /swap-server/hathor-atomic-swap-service
 * // The replace command treats any eventual execution on Windows platforms "\" turns into "/"
 * assert(hPath, 'src/functions/create');
 * @param {string} dirName Directory name of the function's index file
 */
export const handlerPath = (dirName: string) => `${dirName.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
