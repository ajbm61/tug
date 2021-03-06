/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {PackageManager} from '@server/composer/packages/PackageManager';
import {RepositoryManager} from '@server/composer/repositories/RepositoryManager';
import {HttpNotFoundError} from '@server/errors/HttpNotFoundError';
import {Database} from '@server/db/Database';
import {PackageRepository} from '@server/db/repositories/PackageRepository';
import {Translator} from '@server/translators/Translator';
import {LooseObject} from '@server/utils/LooseObject';
import {validateForm} from '@server/utils/validation';
import {Request, Response} from 'express';
import Joi from 'joi';

/**
 * List all package versions of a repository.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function listPackages(req: Request, res: Response, next: Function): Promise<void> {
    const db = req.app.get('db') as Database;
    const repo = db.getRepository<PackageRepository>(PackageRepository);
    const manager: RepositoryManager = req.app.get('repository-manager');
    const packageName = req.params.vendor + '/' + req.params.package;
    const result = await manager.findRepository(packageName);

    if (null === result) {
        throw new HttpNotFoundError();
    }

    const resList = await repo.search({
        name: packageName,
    }, ['version', 'versionNormalized'], req.query.search as string, req.query.lastId as string);

    for (const item of resList.getRows()) {
        if (item.composer) {
            item.composer = JSON.parse(item.composer);
        }
    }

    res.json(resList);
}

/**
 * Refresh all packages or a single package of a repository.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function refreshPackages(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        url: Joi.string(),
        version: Joi.string(),
        force: Joi.boolean(),
    });

    const translator = req.app.get('translator') as Translator;
    const packageManager: PackageManager = req.app.get('package-manager');
    const url = req.body.url;
    const version = req.body.version;
    const force = true === req.body.force;
    const response: LooseObject = {};

    if (url && version) {
        response.url = (await packageManager.refreshPackage(url, version, force, res)).getUrl();
        response.message = translator.trans(res, 'manager.package.refresh.version', {url, version});
    } else if (url) {
        response.url = (await packageManager.refreshPackages(url, force, res)).getUrl();
        response.message = translator.trans(res, 'manager.package.refresh.versions', {url});
    } else {
        const repos = await packageManager.refreshAllPackages(force, res);
        response.message = translator.trans(res, 'manager.package.refresh.versions.all-repositories');
        response.urls = [];
        for (const name of Object.keys(repos)) {
            response.urls.push(repos[name].getUrl());
        }
    }

    res.json(response);
}

/**
 * Delete all packages or a single package of a repository.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function deletePackages(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        url: Joi.string().required(),
        version: Joi.string(),
    });

    const translator = req.app.get('translator') as Translator;
    const packageManager: PackageManager = req.app.get('package-manager');
    let url = req.body.url;
    const version = req.body.version;
    let message;

    if (version) {
        url = (await packageManager.deletePackage(url, version, res)).getUrl();
        message = translator.trans(res, 'manager.package.delete.version', {url, version});
    } else {
        url = (await packageManager.deletePackages(url, res)).getUrl();
        message = translator.trans(res, 'manager.package.delete.versions', {url});
    }

    res.json({
        message,
        url,
    });
}

/**
 * Refresh only the cache for all packages or a single package of a repository.
 *
 * @param {Request}  req  The request
 * @param {Response} res  The response
 * @param {Function} next The next callback
 *
 * @return {Promise<void>}
 */
export async function refreshCachePackages(req: Request, res: Response, next: Function): Promise<void> {
    validateForm(req, {
        url: Joi.string(),
    });

    const translator = req.app.get('translator') as Translator;
    const packageManager: PackageManager = req.app.get('package-manager');
    const url = req.body.url;
    const response: LooseObject = {};

    if (url) {
        response.name = (await packageManager.refreshCachePackages(url, res)).getPackageName();
        response.name = response.name ? response.name : url;
        response.message = translator.trans(res, 'manager.package.refresh.cache.version', {packageName: response.name});
    } else {
        const repos = await packageManager.refreshAllCachePackages(res);
        response.message = translator.trans(res, 'manager.package.refresh.cache.versions');
        response.names = [];
        for (const name of Object.keys(repos)) {
            response.names.push(repos[name].getPackageName());
        }
    }

    res.json(response);
}
