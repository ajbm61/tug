/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {VersionParserInvalidVersionError} from '@server/errors/VersionParserInvalidVersionError';

/**
 * The Composer version parser for javascript.
 *
 * Based on the original PHP class "Composer\Semver\VersionParser" of the Composer Semver
 * repository (https://github.com/composer/semver).
 *
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class VersionParser {

    /**
     * Expand shorthand stability string to long version.
     *
     * @param {string} stability
     *
     * @return {string}
     */
    public static expandStability(stability: string): string {
        stability = stability.toLowerCase();

        switch (stability) {
            case 'a':
                return 'alpha';
            case 'b':
                return 'beta';
            case 'p':
            case 'pl':
                return 'patch';
            case 'rc':
                return 'RC';
            default:
                return stability;
        }
    }
    /**
     * Regex to match pre-release data (sort of).
     *
     * Due to backwards compatibility:
     *   - Instead of enforcing hyphen, an underscore, dot or nothing at all are also accepted.
     *   - Only stabilities as recognized by Composer are allowed to precede a numerical identifier.
     *   - Numerical-only pre-release identifiers are not supported, see tests.
     *
     *                        |--------------|
     * [major].[minor].[patch] -[pre-release] +[build-metadata]
     *
     * @type {string}
     */
    private static modifierRegex = '[._-]?(?:(stable|beta|b|RC|alpha|a|patch|pl|p)((?:[.-]?\\d+)*)?)?([.-]?dev)?';

    /**
     * Normalizes a version string to be able to perform comparisons on it.
     *
     * @param {string} version       The version
     * @param {string} [fullVersion] The full version
     *
     * @return {string}
     *
     * @throws VersionParserInvalidVersionError When the version is invalid
     */
    public normalize(version: string, fullVersion = ''): string {
        version = version.trim();

        if (!fullVersion) {
            fullVersion = version;
        }

        // strip off aliasing
        const aliasMatch = version.match(/^([^,\s]+) +as +([^,\s]+)$/);
        if (aliasMatch) {
            version = aliasMatch[1];
        }

        // match master-like branches
        if (version.match(/^(?:dev-)?(?:master|trunk|default)$/i)) {
            return '9999999-dev';
        }

        // if requirement is branch-like, use full name
        if (version.toLowerCase().startsWith('dev-')) {
            return 'dev-' + version.substr(4);
        }

        // strip off build metadata
        const metaMatch = version.match(/^([^,\s+]+)\+[^\s]+$/);
        if (metaMatch) {
            version = metaMatch[1];
        }

        // match classical versioning
        let index = null;
        let matches = version.match(new RegExp('^v?(\\d{1,5})(\\.\\d+)?(\\.\\d+)?(\\.\\d+)?' + VersionParser.modifierRegex + '$', 'i'));
        if (matches) {
            version = matches[1]
                + (undefined !== matches[2] ? matches[2] : '.0')
                + (undefined !== matches[3] ? matches[3] : '.0')
                + (undefined !== matches[4] ? matches[4] : '.0');
            index = 5;

        // match date(time) based versioning
        } else {
            matches = version.match(new RegExp('^v?(\\d{4}(?:[.:-]?\\d{2}){1,6}(?:[.:-]?\\d{1,3})?)' + VersionParser.modifierRegex + '$', 'i'));
            if (matches) {
                version = matches[1].replace(/\D/g, '.');
                index = 2;
            }
        }

        // add version modifiers if a version was matched
        if (null !== index) {
            if (matches && undefined !== matches[index]) {
                if ('stable' === matches[index]) {
                    return version;
                }

                version += '-' + VersionParser.expandStability(matches[index]) + (undefined !== matches[index + 1] ? matches[index + 1].replace(/^\.|^-/g, '') : '');
            }

            if (matches && undefined !== matches[index + 2]) {
                version += '-dev';
            }

            return version;
        }

        // match dev branches
        const branchMatch = version.match(/(.*?)[.-]?dev$/i);
        if (branchMatch) {
            try {
                return this.normalizeBranch(branchMatch[1]);
            } catch (e) {}
        }

        throw new VersionParserInvalidVersionError(version , fullVersion);
    }

    /**
     * Normalizes a branch name to be able to perform comparisons on it.
     *
     * @param {string} name
     *
     * @return {string}
     */
    public normalizeBranch(name: string): string {
        name = name.trim();
        const validNames = ['master', 'trunk', 'default'];

        if (validNames.includes(name)) {
            return this.normalize(name);
        }

        const matches = name.match(/^v?(\d+)(\.(?:\d+|[xX*]))?(\.(?:\d+|[xX*]))?(\.(?:\d+|[xX*]))?$/i);
        if (matches) {
            let version = '';
            for (let i = 1; i < 5; ++i) {
                version += undefined !== matches[i] ? matches[i].replace(/(X)|(\*)/g, 'x') : '.x';
            }

            return version.replace(/x/g, '9999999') + '-dev';
        }

        return 'dev-' + name;
    }
}
