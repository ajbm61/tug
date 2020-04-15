/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {HttpUnauthorizedError} from '@server/errors/HttpUnauthorizedError';
import {AuthBuilder} from '@server/middlewares/auth/builders/AuthBuilder';
import {validateForm} from '@server/utils/validation';
import {Request, Response} from 'express';
import Joi from 'joi';

/**
 * Create the temporary token.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function createToken(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        username: Joi.string().required(),
        password: Joi.string().required(),
    });

    const token = await (req.app.get('basic-auth-builder') as AuthBuilder).createToken(req);

    if (false === token) {
        throw new HttpUnauthorizedError();
    }

    res.json({
        token,
    });
}
