/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {LooseObject} from '@server/utils/LooseObject';
import fs from 'fs';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class AssetManager
{
    private readonly manifestFile: string;
    private readonly debug: boolean;

    private manifest:LooseObject|null = null;

    /**
     * Constructor.
     *
     * @param {string}  manifestFile
     * @param {boolean} debug
     */
    constructor(manifestFile: string, debug: boolean = false) {
        this.manifestFile = manifestFile;
        this.debug = debug;
    }

    /**
     * Get the real asset path.
     *
     * @param {string} path The asset path
     *
     * @return {string}
     */
    public get(path: string): string {
        if (null === this.manifest) {
            try {
                this.manifest = JSON.parse(fs.readFileSync(this.manifestFile).toString()) as LooseObject;
            } catch (e) {
                this.manifest = {};
            }
        }

        let val = this.manifest.hasOwnProperty(path) ? this.manifest[path] : path;

        if (this.debug) {
            this.manifest = null;
        }

        return val;
    }
}
