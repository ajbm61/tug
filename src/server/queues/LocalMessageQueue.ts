/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {BaseMessageQueue} from '@server/queues/BaseMessageQueue';
import {LooseObject} from '@server/utils/LooseObject';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class LocalMessageQueue extends BaseMessageQueue {
    /**
     * @inheritDoc
     */
    public async send(message: LooseObject, delay?: number): Promise<void> {
        await this.sendBatch([message], delay);
    }

    /**
     * @inheritDoc
     */
    public async sendBatch(messages: LooseObject[], delay?: number): Promise<void> {
        if (0 === messages.length) {
            return;
        }

        const self = this;
        setTimeout(async () => {
            await self.receive(messages);
        }, (delay || 0) * 1000);
    }
}
