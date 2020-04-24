#!/usr/bin/env node

/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

require('dotenv').config();
const fetch = require('node-fetch');
const program = require('commander');
const utils = require('./utils/utils');
const getEndpoint = require('./utils/endpoint').getEndpoint;
const validateResponse = require('./utils/endpoint').validateResponse;
const createHeaders = require('./utils/endpoint').createHeaders;

program
    .description('Refresh the versions of package')
    .option('-e, --endpoint <url>', 'Define the endpoint of Tug API (use for local dev)', false)
    .option('-u, --url <url>', 'The repository URL, or empty to refresh all repositories')
    .option('-n, --version <version>', 'The specific version, or empty to refresh all versions')
    .option('-f, --force', 'Check if the package must be actualized even if it exists')
    .parse(process.argv);

utils.spawn('node bin/config -e')
    .then(() => getEndpoint(program))
    .then((endpoint) => {
        return fetch(endpoint + '/manager/packages/refresh', {
            method: 'PUT',
            body: JSON.stringify({
                url: program.url,
                version: program.version,
                force: program.force
            }),
            headers: createHeaders()
        })
    })
    .then(async (res) => await validateResponse(res))
    .then(async (res) => (await res.json()).message)
    .then((mess) => console.info(mess))
    .catch(utils.displayError);
