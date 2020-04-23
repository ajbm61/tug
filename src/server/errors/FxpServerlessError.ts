/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class FxpServerlessError extends Error {
    // tslint:disable-next-line:variable-name
    private __proto__: Error;

    /**
     * Constructor.
     *
     * @param {string} [message]
     */
    constructor(message?: string) {
        // fix checking of instanceof class extending the error (https://github.com/Microsoft/TypeScript/issues/13965)
        const trueProto = new.target.prototype;
        super(message);
        this.__proto__ = trueProto;
    }
}
