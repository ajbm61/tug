/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {PackageError} from '@server/errors/PackageError';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class PackageAttributeRequiredError extends PackageError {
    public readonly attribute: string;

    /**
     * Constructor.
     *
     * @param {string} attribute The attribute name
     */
    constructor(attribute: string) {
        super(`The "${attribute}" attribute of package is required`);
        this.attribute = attribute;
    }
}
