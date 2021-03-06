/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {createApiKey, deleteApiKey, listApiKey} from '@server/controllers/manager/apiKeyController';
import {createGithubOauth, deleteGithubOauth, showGithubOauth} from '@server/controllers/manager/githubOauthController';
import {createGitlabOauth, deleteGitlabOauth, showGitlabOauth} from '@server/controllers/manager/gitlabOauthController';
import {createGithubToken, deleteGithubToken, showGithubToken} from '@server/controllers/manager/githubTokenController';
import {createGitlabToken, deleteGitlabToken, showGitlabToken} from '@server/controllers/manager/gitlabTokenController';
import {
    deletePackages,
    listPackages,
    refreshCachePackages,
    refreshPackages,
} from '@server/controllers/manager/packageController';
import {
    disableRepository,
    enableRepository,
    listRepository,
    showRepository,
} from '@server/controllers/manager/repositoryController';
import {Authenticate} from '@server/middlewares/auth/Authenticate';
import {AuthStrategy} from '@server/middlewares/auth/strategies/AuthStrategy';
import {asyncHandler} from '@server/utils/handler';
import {Router} from 'express';
import {HttpNotFoundError} from '@server/errors/HttpNotFoundError';

/**
 * Generate the routes.
 *
 * @param {Router}       router            The router
 * @param {AuthStrategy} basicAuthStrategy The auth strategy
 *
 * @return {Router}
 */
export function managerRoutes(router: Router, basicAuthStrategy: AuthStrategy): Router {
    router.use(asyncHandler(Authenticate.middleware(basicAuthStrategy)));

    router.get('/api-keys', asyncHandler(listApiKey));
    router.post('/api-keys', asyncHandler(createApiKey));
    router.delete('/api-keys', asyncHandler(deleteApiKey));

    router.post('/github-oauth', asyncHandler(createGithubOauth));
    router.get('/github-oauth', asyncHandler(showGithubOauth));
    router.delete('/github-oauth', asyncHandler(deleteGithubOauth));

    router.post('/gitlab-oauth', asyncHandler(createGitlabOauth));
    router.get('/gitlab-oauth', asyncHandler(showGitlabOauth));
    router.delete('/gitlab-oauth', asyncHandler(deleteGitlabOauth));

    router.post('/github-token', asyncHandler(createGithubToken));
    router.get('/github-token', asyncHandler(showGithubToken));
    router.delete('/github-token', asyncHandler(deleteGithubToken));

    router.post('/gitlab-token', asyncHandler(createGitlabToken));
    router.get('/gitlab-token', asyncHandler(showGitlabToken));
    router.delete('/gitlab-token', asyncHandler(deleteGitlabToken));

    router.get('/repositories', asyncHandler(listRepository));
    router.post('/repositories', asyncHandler(enableRepository));
    router.delete('/repositories', asyncHandler(disableRepository));
    router.get('/repositories/:id', asyncHandler(showRepository));

    router.put('/packages/refresh', asyncHandler(refreshPackages));
    router.put('/packages/refresh-all', asyncHandler(refreshCachePackages));
    router.delete('/packages', asyncHandler(deletePackages));

    router.get('/packages/:vendor/:package/versions', asyncHandler(listPackages));

    router.use(asyncHandler(() => {
        throw new HttpNotFoundError();
    }));

    return router;
}
