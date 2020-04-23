/*
 * This file is part of the Tug package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Generate a pseudo token.
 *
 * @param {number} [size] The size of id
 *
 * @return {string}
 */
export function generateToken(size: number): string {
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    size = size || 10;

    for (let i = 0; i < size; i++) {
        token += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }

    return token;
}
