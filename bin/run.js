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

require('dotenv').config({path: '.env.local'});
const program = require('commander');
const utils = require('./utils/utils');

program
    .description('Run the external command with the project environment variables and replace {ENV_VAR_NAME} command variables by their values')
    .parse(process.argv);

utils.spawn(process.argv.slice(2).join(' '))
    .catch(utils.displayError);
