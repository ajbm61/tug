/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {BaseService} from '../BaseService';
import {Canceler} from '../Canceler';
import {ListOptions} from '../models/requests/ListOptions';
import {CodeRepository} from '../models/responses/CodeRepository';
import {ListResponse} from '../models/responses/ListResponse';
import {RepositoryRequest} from '../models/requests/RepositoryRequest';
import {RepositoryResponse} from '../models/responses/RepositoryResponse';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class Repositories extends BaseService {
    /**
     * @inheritDoc
     */
    public static getName() {
        return 'Repositories';
    }

    /**
     * Get or create the authorization.
     *
     * @param {ListOptions} [options]
     * @param {Canceler}    [canceler]
     *
     * @return {Promise<ListResponse<CodeRepository>>}
     */
    public async list(options?: ListOptions, canceler?: Canceler): Promise<ListResponse<CodeRepository>> {
        return this.requestList<CodeRepository>({
            url: '/manager/repositories', params: options || {},
        }, canceler);
    }

    public async enable(data: RepositoryRequest,
                        canceler?: Canceler): Promise<RepositoryResponse> {
        return await this.request<RepositoryResponse>({
            method: 'POST',
            url: '/manager/repositories',
            data,
        }, canceler) as RepositoryResponse;
    }

    public async disable(data: RepositoryRequest,
                         canceler?: Canceler): Promise<RepositoryResponse> {
        return await this.request<RepositoryResponse>({
            method: 'DELETE',
            url: '/manager/repositories',
            data,
        }, canceler) as RepositoryResponse;
    }
}
