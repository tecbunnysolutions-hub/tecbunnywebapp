import crypto from 'crypto';
import { logger } from '@tecbunny/core';
const GATEWAY_URL = {
    test: 'https://test.payu.in/_payment',
    production: 'https://secure.payu.in/_payment',
};
import { verifyPaymentHash } from './crypto-utils';
export const sanitizeHashValue = (val) => {
    if (val === undefined || val === null)
        return '';
    // Avoid replacing inner spaces or characters as PayU calculates hash on EXACT values
    return String(val).trim();
};
function normaliseValue(value) {
    if (value == null) {
        return '';
    }
    // Simply return the string representation without modifying decimals
    // as PayU uses the exact string from the payload to generate the hash
    return sanitizeHashValue(value);
}
function collectUdfValues(source) {
    return Array.from({ length: 10 }, (_, index) => {
        const key = `udf${index + 1}`;
        return normaliseValue(source[key]);
    });
}
function timingSafeSha512HexEqual(expectedHex, candidateHex) {
    const cleanCandidate = candidateHex?.trim().toLowerCase() ?? '';
    const isValidSha512Hex = /^[a-f0-9]{128}$/.test(cleanCandidate);
    if (!isValidSha512Hex)
        return false;
    return verifyPaymentHash(cleanCandidate, expectedHex);
}
export function getPayuPaymentUrl(environment) {
    return GATEWAY_URL[environment] ?? GATEWAY_URL.test;
}
export function normalisePayuEnvironment(value) {
    if (!value) {
        return 'test';
    }
    const normalised = value.trim().toLowerCase();
    const condensed = normalised.replace(/[\s_-]+/g, '').replace(/[()]/g, '');
    if (condensed === 'production' ||
        condensed === 'prod' ||
        condensed === 'live' ||
        condensed === 'livemode' ||
        condensed === 'productionlive' ||
        condensed === 'golive') {
        return 'production';
    }
    if (condensed === 'sandbox' ||
        condensed === 'demo' ||
        condensed === 'uat' ||
        condensed === 'staging') {
        return 'test';
    }
    if (condensed.includes('live') || condensed.includes('prod')) {
        return 'production';
    }
    if (condensed.includes('sandbox') ||
        condensed.includes('demo') ||
        condensed.includes('test') ||
        condensed.includes('stage') ||
        condensed.includes('uat')) {
        return 'test';
    }
    return normalised === 'production' || normalised === 'prod' || normalised === 'live'
        ? 'production'
        : 'test';
}
export function generatePayuHash(config, payload) {
    if (!config.merchantKey || !config.merchantSalt) {
        throw new Error('PayU signature generation failed: Merchant key or salt is missing.');
    }
    const udfValues = collectUdfValues(payload);
    const hashSequence = [
        config.merchantKey,
        payload.txnId,
        payload.amount,
        payload.productInfo,
        payload.firstName,
        payload.email,
        ...udfValues,
        config.merchantSalt,
    ].map(sanitizeHashValue).join('|');
    return crypto.createHash('sha512').update(hashSequence).digest('hex');
}
export function verifyPayuHash(config, response) {
    if (!response.hash) {
        return false;
    }
    if (!config.merchantKey || !config.merchantSalt) {
        logger.error('PayU signature verification failed: Merchant key or salt is missing.');
        return false;
    }
    const udfValuesForward = collectUdfValues(response);
    const udfValuesReversed = [...udfValuesForward].reverse();
    const additionalCharges = normaliseValue(response.additionalCharges || response['additional_charges']);
    const baseSequence = [
        config.merchantSalt,
        normaliseValue(response.status),
        ...udfValuesReversed,
        normaliseValue(response.email),
        normaliseValue(response.firstname),
        normaliseValue(response.productinfo),
        normaliseValue(response.amount),
        normaliseValue(response.txnid),
        config.merchantKey,
    ];
    const hashSequence = additionalCharges
        ? [additionalCharges, ...baseSequence].map(sanitizeHashValue).join('|')
        : baseSequence.map(sanitizeHashValue).join('|');
    const expectedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');
    return timingSafeSha512HexEqual(expectedHash, response.hash);
}
