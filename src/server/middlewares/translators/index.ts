/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Translator} from '@server/translators/Translator';
import {Request, Response} from 'express';

/**
 * Display the list of all packages in the "provider" format.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export function defineLocale(req: Request, res: Response, next: Function): void {
    (req.app.get('translator') as Translator).setLocaleByRequest(res, req);
    next();
}
