/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {ConfigManager} from '@server/configs/ConfigManager';
import {Translator} from '@server/translators/Translator';
import {LooseObject} from '@server/utils/LooseObject';
import {generateToken} from '@server/utils/token';
import {validateForm} from '@server/utils/validation';
import {Request, Response} from 'express';
import Joi from 'joi';

/**
 * Create the gitlab token.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function createGitlabToken(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        token: Joi.string().min(10),
        host: Joi.string(),
    });

    const configManager: ConfigManager = req.app.get('config-manager');
    const translator = req.app.get('translator') as Translator;
    const token = req.body.token ? req.body.token : generateToken(40);
    const host = req.body.host ? req.body.host : 'gitlab.com';
    const data: LooseObject = {
        'gitlab-webhook': {},
    };
    data['gitlab-webhook'][host] = token;

    await configManager.put(data);

    res.json({
        message: translator.trans(res, 'manager.config.gitlab-token.created', {token, host}),
        host,
        token,
    });
}

/**
 * Delete the gitlab token.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function deleteGitlabToken(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        host: Joi.string(),
    });

    const configManager: ConfigManager = req.app.get('config-manager');
    const translator = req.app.get('translator') as Translator;
    const host = req.body.host ? req.body.host : 'gitlab.com';

    const config = (await configManager.get()).all();
    delete config['gitlab-webhook'][host];
    await configManager.put(config, true);

    res.json({
        message: translator.trans(res, 'manager.config.gitlab-token.deleted', {host}),
        host,
    });
}

/**
 * Show the gitlab token.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function showGitlabToken(req: Request, res: Response, next: Function): Promise<void> {
    const config = await (req.app.get('config-manager') as ConfigManager).get();
    const translator = req.app.get('translator') as Translator;
    const tokens = config.get('gitlab-webhook');
    let message;

    if (tokens && Object.keys(tokens).length > 0) {
        const tokenHosts = Object.keys(tokens);
        let strTokens = '';
        for (const tokenHost of tokenHosts) {
            strTokens += tokens[tokenHost] + ' (' + tokenHost + '), ';
        }

        message = translator.trans(res, 'manager.config.gitlab-token', {tokens: strTokens.replace(/, $/g, '')});
    } else {
        message = translator.trans(res, 'manager.config.gitlab-token.empty');
    }

    res.json({
        message,
        tokens,
    });
}
