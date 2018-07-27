/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import auth from 'basic-auth';
import AuthStrategy from './AuthStrategy';
import ApiKeyRepository from '../../../db/repositories/ApiKeyRepository';
import Database from '../../../db/Database';
import {Request} from 'express';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export default class BasicTokenAuth implements AuthStrategy
{
    /**
     * @inheritDoc
     */
    public async logIn(req: Request): Promise<boolean> {
        let repo = (req.app.get('db') as Database).getRepository(ApiKeyRepository);
        let user = auth(req);

        return undefined !== user && 'token' === user.name && await repo.has(user.pass);
    }
}