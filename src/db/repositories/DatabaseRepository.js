/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Results from '../Results';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export default class DatabaseRepository
{
    /**
     * Constructor.
     *
     * @param {Database}    client   The database client
     * @param {String|null} [prefix] The id prefix
     */
    constructor(client, prefix = null) {
        this.client = client;
        this.prefix = prefix;
    }

    /**
     * Check if the id exist.
     *
     * @param {String} id The id
     *
     * @return {Promise<boolean>}
     */
    async has(id) {
        return this.client.has(this.getPrefixedId(id));
    }

    /**
     * Get the data of id or null if the id doesn't exist.
     *
     * @param {String} id The id
     *
     * @return {Promise<String|null>}
     */
    async get(id) {
        return this.client.get(this.getPrefixedId(id));
    }

    /**
     * Put the data.
     *
     * @param {Object} data The data
     *
     * @return {Promise<String>}
     */
    async put(data) {
        if (data.id) {
            data.id = this.getPrefixedId(data.id);
        }

        return this.client.put(data);
    }

    /**
     * Delete the id.
     *
     * @param {String} id The id
     *
     * @return {Promise<String>}
     */
    async delete(id) {
        return this.client.delete(this.getPrefixedId(id));
    }

    /**
     * Find the records.
     *
     * @param {Object}      criteria The criteria
     * @param {String|null} startId  The start id
     *
     * @return {Promise<Results>}
     */
    async find(criteria, startId = null) {
        if (criteria.id) {
            criteria.id = this.getPrefixedId(criteria.id);
        }

        return this.client.find(criteria, this.prefix, startId);
    }

    /**
     * Find one record.
     *
     * @param {Object} criteria The criteria
     *
     * @return {Promise<Object>}
     */
    async findOne(criteria) {
        if (criteria.id) {
            criteria.id = this.getPrefixedId(criteria.id);
        }

        return this.client.findOne(criteria, this.prefix);
    }

    /**
     * Get the prefix of id.
     *
     * @param {String} id The id
     *
     * @return {String}
     */
    getPrefixedId(id) {
        return this.prefix ? this.prefix + ':' + id : id;
    }

    /**
     * Get the name of repository.
     *
     * @return {string}
     */
    static getName() {
        return '';
    }
};