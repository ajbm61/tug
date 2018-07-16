/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HttpNotFoundError from './HttpNotFoundError';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export default class TagNotFoundError extends HttpNotFoundError
{
    /**
     * Constructor.
     *
     * @param {String} tagName
     * @param {String} [fileName}
     * @param {Number} [lineNumber}
     */
    constructor(tagName, fileName, lineNumber) {
        super(`Tag "${tagName}" is not found`, fileName, lineNumber);
    }
}
