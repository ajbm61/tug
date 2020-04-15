/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Request} from 'express';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export interface AuthStrategy
{
    /**
     * Log in.
     *
     * @param {Request} req The request
     *
     * @return {boolean}
     */
    logIn(req: Request): Promise<boolean>;
}
