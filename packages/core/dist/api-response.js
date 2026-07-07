import { NextResponse } from 'next/server';
import { logger } from './logger';
export class APIResponseBuilder {
    static generateRequestId() {
        try {
            return crypto.randomUUID();
        }
        catch {
            return Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        }
    }
    static success(data, statusCode = 200, meta) {
        const response = {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.generateRequestId(),
                version: '1.0.0',
                ...meta
            }
        };
        return NextResponse.json(response, { status: statusCode });
    }
    static error(code, message, statusCode = 400, details, requestId) {
        const response = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details })
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: requestId || this.generateRequestId(),
                version: '1.0.0'
            }
        };
        // Log error responses
        logger.error('API Error Response', {
            code,
            message,
            statusCode,
            details,
            requestId: response.meta?.requestId
        });
        return NextResponse.json(response, { status: statusCode });
    }
    static paginated(data, pagination, statusCode = 200) {
        const { page = 1, limit = 10, total = 0 } = pagination;
        const totalPages = Math.ceil(total / limit);
        const response = {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.generateRequestId(),
                version: '1.0.0',
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            }
        };
        return NextResponse.json(response, { status: statusCode });
    }
    static created(data) {
        return this.success(data, 201);
    }
    static noContent() {
        const response = {
            success: true,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.generateRequestId(),
                version: '1.0.0'
            }
        };
        return NextResponse.json(response, { status: 204 });
    }
    static badRequest(message, details) {
        return this.error('BAD_REQUEST', message, 400, details);
    }
    static unauthorized(message = 'Authentication required') {
        return this.error('UNAUTHORIZED', message, 401);
    }
    static forbidden(message = 'Access denied') {
        return this.error('FORBIDDEN', message, 403);
    }
    static notFound(message = 'Resource not found') {
        return this.error('NOT_FOUND', message, 404);
    }
    static conflict(message, details) {
        return this.error('CONFLICT', message, 409, details);
    }
    static unprocessableEntity(message, details) {
        return this.error('UNPROCESSABLE_ENTITY', message, 422, details);
    }
    static tooManyRequests(message = 'Rate limit exceeded', retryAfter) {
        const headers = {};
        if (retryAfter) {
            headers['Retry-After'] = retryAfter.toString();
        }
        const response = this.error('RATE_LIMIT_EXCEEDED', message, 429);
        // Add headers to the response
        if (retryAfter) {
            response.headers.set('Retry-After', retryAfter.toString());
        }
        return response;
    }
    static internalServerError(message = 'Internal server error', details) {
        // Don't expose details in production
        const exposedDetails = process.env.NODE_ENV === 'development' ? details : undefined;
        return this.error('INTERNAL_SERVER_ERROR', message, 500, exposedDetails);
    }
    static serviceUnavailable(message = 'Service temporarily unavailable') {
        return this.error('SERVICE_UNAVAILABLE', message, 503);
    }
}
// Common response helpers
export const APIResponses = {
    // Auth responses
    loginSuccess: (user, token) => APIResponseBuilder.success({ user, token, message: 'Login successful' }),
    loginFailed: () => APIResponseBuilder.unauthorized('Invalid credentials'),
    tokenExpired: () => APIResponseBuilder.unauthorized('Token expired'),
    accountNotVerified: () => APIResponseBuilder.forbidden('Account not verified'),
    // OTP responses
    otpSent: (channel, maskedContact) => APIResponseBuilder.success({
        message: `OTP sent via ${channel}`,
        channel,
        maskedContact
    }),
    otpVerified: () => APIResponseBuilder.success({ message: 'OTP verified successfully' }),
    otpInvalid: () => APIResponseBuilder.badRequest('Invalid or expired OTP'),
    otpExpired: () => APIResponseBuilder.badRequest('OTP has expired'),
    // Communication preferences responses
    preferencesUpdated: () => APIResponseBuilder.success({ message: 'Communication preferences updated' }),
    preferencesRetrieved: (preferences) => APIResponseBuilder.success(preferences),
    // Validation responses
    validationError: (field, message) => APIResponseBuilder.badRequest(`Validation error: ${message}`, { field }),
    missingField: (field) => APIResponseBuilder.badRequest(`Missing required field: ${field}`, { field }),
    // Generic responses
    operationSuccess: (message, data) => APIResponseBuilder.success({ message, ...data }),
    operationFailed: (message, details) => APIResponseBuilder.badRequest(message, details),
    // WhatsApp responses
    whatsappSent: (messageId) => APIResponseBuilder.success({
        message: 'WhatsApp message sent successfully',
        messageId
    }),
    whatsappFailed: (error) => APIResponseBuilder.internalServerError('Failed to send WhatsApp message', { error }),
    // Health check responses
    healthCheck: (status) => APIResponseBuilder.success(status),
    serviceDown: (service) => APIResponseBuilder.serviceUnavailable(`${service} service is currently unavailable`)
};
// Type guards for response validation
export function isAPIResponse(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.success === 'boolean' &&
        (obj.data !== undefined || obj.error !== undefined));
}
export function isSuccessResponse(response) {
    return response.success === true && response.data !== undefined;
}
export function isErrorResponse(response) {
    return response.success === false && response.error !== undefined;
}
