/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {QueueReceiver} from '@server/queues/QueueReceiver';
import {LooseObject} from '@server/utils/LooseObject';
import {Response} from 'express';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export interface MessageQueue
{
    /**
     * Subscribe a receiver in queue.
     *
     * @param {QueueReceiver} receiver The queue receiver
     */
    subscribe(receiver: QueueReceiver): void;

    /**
     * Receive the messages.
     *
     * @param {LooseObject[]} messages The messages comes from queue
     * @param {Response}      [res]    The response
     */
    receive(messages: LooseObject[], res?: Response): Promise<void>;

    /**
     * Send a message in the queue.
     *
     * @param {LooseObject} message
     * @param {number}      [delay]
     */
    send(message: LooseObject, delay?: number): Promise<void>

    /**
     * Send messages in the queue.
     *
     * @param {LooseObject[]} messages
     * @param {number}        [delay]
     */
    sendBatch(messages: LooseObject[], delay?: number): Promise<void>;
}
