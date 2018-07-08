/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AuthStrategy from './AuthStrategy';
import auth from 'basic-auth';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export default class BasicTokenAuth extends AuthStrategy
{
    /**
     * Constructor.
     *
     * @param {DataStorage} storage The storage
     */
    constructor(storage) {
        super();
        this.storage = storage;
    }

    /**
     * @inheritDoc
     */
    async logIn(req) {
        let user = auth(req);

        return user && 'token' === user.name && await this.storage.has('api-keys/' + user.pass);
    }
}