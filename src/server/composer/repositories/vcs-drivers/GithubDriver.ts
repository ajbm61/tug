/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {VcsDriver} from '@server/composer/repositories/vcs-drivers/VcsDriver';
import {RemoteFilesystem} from '@server/composer/utils/RemoteFilesystem';
import {Config} from '@server/configs/Config';
import {TransportError} from '@server/errors/TransportError';
import {VcsDriverContentNotFoundError} from '@server/errors/VcsDriverContentNotFoundError';
import {VcsDriverInvalidJsonError} from '@server/errors/VcsDriverInvalidJsonError';
import {VcsDriverInvalidUrlError} from '@server/errors/VcsDriverInvalidUrlError';
import {LooseObject} from '@server/utils/LooseObject';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class GithubDriver extends VcsDriver {

    /**
     * @inheritDoc
     */
    public static supports(config: Config, url: string, deep: boolean = false): boolean {
        const matches = url.match(/^((?:https?|git):\/\/([^\/]+)\/|git@([^:]+):)([^\/]+)\/(.+?)(?:\.git|\/)?$/);

        if (!matches) {
            return false;
        }

        const originUrl = undefined !== matches[2] ? matches[2] : matches[3];

        return Object.keys(config.get('github-oauth')).includes(originUrl.replace(/^www\./i, ''));
    }

    private readonly originUrl: string;
    private readonly infoCache: LooseObject;

    private owner: string;
    private repository: string;
    private repoData: LooseObject|null;
    private rootIdentifier: string|null;
    private isPrivate: boolean;
    private hasIssues: boolean;
    private tags: LooseObject|null;
    private branches: LooseObject|null;

    /**
     * Constructor.
     *
     * @param {LooseObject}      repoConfig         The repository config
     * @param {Config}           config             The config
     * @param {RemoteFilesystem} [remoteFilesystem] The remote filesystem
     */
    constructor(repoConfig: LooseObject, config: Config, remoteFilesystem?: RemoteFilesystem) {
        super(repoConfig, config, remoteFilesystem);

        const match: LooseObject|null = this.url.match(/^(?:(?:https?|git):\/\/([^\/]+)\/|git@([^:]+):)([^\/]+)\/(.+?)(?:\.git|\/)?$/);

        if (null === match) {
            throw new VcsDriverInvalidUrlError('Github', this.url);
        }

        this.owner = match[3];
        this.repository = match[4];
        this.originUrl = undefined !== match[1] ? match[1] : match[2];

        if ('www.github.com' === this.originUrl) {
            this.originUrl = 'github.com';
        }

        this.url = `https://${this.originUrl}/${this.owner}/${this.repository}.git`;
        this.repoConfig.url = this.url;
        this.repoData = null;
        this.rootIdentifier = null;
        this.isPrivate = false;
        this.hasIssues = false;
        this.infoCache = {};
        this.tags = null;
        this.branches = null;
    }

    /**
     * @inheritDoc
     */
    public getUrl(): string {
        return this.url;
    }

    /**
     * Get the api url.
     *
     * @return {string}
     */
    public getApiUrl(): string {
        const apiUrl = 'github.com' === this.originUrl ? 'api.github.com' : `${this.originUrl}/api/v3`;

        return `https://${apiUrl}`;
    }

    /**
     * Generate an ssh url.
     *
     * @return {string}
     */
    public generateSshUrl(): string {
        return `git@${this.originUrl}:${this.owner}/${this.repository}.git`;
    }

    /**
     * @inheritDoc
     */
    public async getRepoData(): Promise<Object|null> {
        await this.fetchRootIdentifier();

        return this.repoData;
    }

    /**
     * @inheritDoc
     */
    public async getRootIdentifier(): Promise<string> {
        await this.fetchRootIdentifier();

        return this.rootIdentifier as string;
    }

    /**
     * @inheritDoc
     */
    public getSource(identifier: string): LooseObject {
        const url = this.isPrivate ? this.generateSshUrl() : this.getUrl();

        return {
            type: 'git',
            url,
            reference: identifier,
        };
    }

    /**
     * @inheritDoc
     */
    public getDist(identifier: string): LooseObject {
        const url = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}/zipball/${identifier}`;

        return {
            type: 'zip',
            url,
            reference: identifier,
            shasum: '',
        };
    }

    /**
     * @inheritDoc
     */
    public async getComposerInformation(identifier: string): Promise<LooseObject|null> {
        if (!this.infoCache[identifier]) {
            this.infoCache[identifier] = await this.getBaseComposerInformation(identifier);
        }

        return this.infoCache[identifier];
    }

    /**
     * @inheritDoc
     */
    public async getFileContent(file: string, identifier: string): Promise<string|null> {
        let content = null;
        let error = null;

        try {
            const resourceFile: string = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}/contents/${file}?ref=${encodeURIComponent(identifier)}`;
            const resource = JSON.parse(await this.getContents(resourceFile) as string);

            if (resource.content && 'base64' === resource.encoding) {
                content = Buffer.from(resource.content, 'base64').toString();
            } else {
                error = new VcsDriverContentNotFoundError(file, identifier);
            }
        } catch (e) {
            if (e instanceof TransportError) {
                if (404 !== e.statusCode) {
                    error = e;
                }
            }
        }

        if (error) {
            throw error;
        }

        return content;
    }

    /**
     * @inheritDoc
     */
    public async getChangeDate(identifier: string): Promise<Date|null> {
        const resource = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}/commits/${encodeURIComponent(identifier)}`;
        const commit = JSON.parse(await this.getContents(resource) as string);

        return new Date(commit.commit.committer.date);
    }

    /**
     * @inheritDoc
     */
    public async getTags(): Promise<LooseObject> {
        if (null === this.tags) {
            this.tags = {};
            const resourceFile = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}/tags?per_page=100`;
            let resource = null;

            do {
                const tagsData = JSON.parse(await this.getContents(resourceFile) as string);
                if (tagsData) {
                    for (const tag of tagsData) {
                        this.tags[tag.name] = tag.commit.sha;
                    }
                }

                resource = this.getNextPage();
            } while (resource);
        }

        return this.tags;
    }

    /**
     * @inheritDoc
     */
    public async getBranches(): Promise<LooseObject> {
        if (null === this.branches) {
            this.branches = {};
            const resourceFile = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}/git/refs/heads?per_page=100`;
            let resource = null;
            const branchBlacklist = ['gh-pages'];

            do {
                const branchData = JSON.parse(await this.getContents(resourceFile) as string);
                if (branchData) {
                    for (const branch of branchData) {
                        const name = branch.ref.substr(11);

                        if (!branchBlacklist.includes(name)) {
                            this.branches[name] = branch.object.sha;
                        }
                    }
                }

                resource = this.getNextPage();
            } while (resource);
        }

        return this.branches;
    }

    /**
     * @inheritDoc
     */
    public async getContents(url: string, fetchingRepoData: boolean = false): Promise<string|boolean> {
        try {
            return await this.rfs.get(this.originUrl, url, {});
        } catch (e) {
            return false;
        }
    }

    /**
     * Fetch the root identifier.
     */
    private async fetchRootIdentifier(): Promise<void> {
        if (this.repoData) {
            return;
        }

        const repoDataUrl = `${this.getApiUrl()}/repos/${this.owner}/${this.repository}`;
        const contentData: string|boolean = await this.getContents(repoDataUrl, true);
        try {
            this.repoData = JSON.parse(contentData as string);
        } catch (e) {
            throw new VcsDriverInvalidJsonError(repoDataUrl, e.message);
        }

        if (this.repoData) {
            this.owner = this.repoData.owner.login;
            this.repository = this.repoData.name;
            this.isPrivate = undefined !== this.repoData.private && this.repoData.private;
            this.hasIssues = undefined !== this.repoData.has_issues && this.repoData.has_issues;

            if (this.repoData.hasOwnProperty('default_branch')) {
                this.rootIdentifier = this.repoData.default_branch;
            } else if (this.repoData.hasOwnProperty('master_branch')) {
                this.rootIdentifier = this.repoData.master_branch;
            }
        }

        if (!this.rootIdentifier) {
            this.rootIdentifier = 'master';
        }
    }

    /**
     * Get the next page.
     *
     * @return {string|null}
     */
    private getNextPage(): string|null {
        const headers: LooseObject = this.rfs.getLastHeaders();

        if (headers.link) {
            for (const i of Object.keys(headers.link)) {
                const link = headers.link[i];
                const match = link.match(/<(.+?)>; *rel="next"/);

                if (match) {
                    return match[1];
                }
            }
        }

        return null;
    }
}
