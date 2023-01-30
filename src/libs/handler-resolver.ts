/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const handlerPath = (context: string) => `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
