/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Database} from '@server/db/Database';
import {ApiKeyRepository} from '@server/db/repositories/ApiKeyRepository';
import {HttpValidationError} from '@server/errors/HttpValidationError';
import {Translator} from '@server/translators/Translator';
import {generateToken} from '@server/utils/token';
import {validateForm} from '@server/utils/validation';
import {Request, Response} from 'express';
import Joi from 'joi';

/**
 * List the api keys.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function listApiKey(req: Request, res: Response, next: Function): Promise<void> {
    let db = req.app.get('db') as Database;
    let repo = db.getRepository<ApiKeyRepository>(ApiKeyRepository);
    res.json(await repo.search({}, ['id'], <string> req.query.search, <string> req.query.lastId));
}

/**
 * Create the api key.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function createApiKey(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        token: Joi.string().min(10)
    });

    let translator = req.app.get('translator') as Translator;
    let repo = (req.app.get('db') as Database).getRepository(ApiKeyRepository);
    let token = req.body.token ? req.body.token : generateToken(40);

    await repo.put({id: token});

    res.json({
        message: translator.trans(res, 'manager.api-key.created', {token: token}),
        token: token
    });
}

/**
 * Delete the api key.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function deleteApiKey(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        token: Joi.string().min(10)
    });

    let translator = req.app.get('translator') as Translator;
    let repo = (req.app.get('db') as Database).getRepository(ApiKeyRepository);
    let token = req.body.token;

    if (!token) {
        throw new HttpValidationError({
            'token': translator.trans(res, 'validation.field.required')
        });
    }

    await repo.delete(token);

    res.json({
        message: translator.trans(res, 'manager.api-key.deleted', {token: token}),
        token: token
    });
}
