import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'Tecbunny API',
    version: '1.0.0',
    description: 'Core API contract for authentication and platform endpoints.',
  },
  servers: [
    { url: '/api', description: 'Default API namespace' },
    { url: '/api/v1', description: 'Version 1 API namespace' },
  ],
  components: {
    schemas: {
      StandardResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'errors', 'meta'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: ['object', 'array', 'string', 'number', 'boolean', 'null'] },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                field: { type: 'string' },
                details: { type: 'object', additionalProperties: true },
              },
            },
          },
          meta: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      SendOtpRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', maxLength: 254 },
          mobile: { type: 'string', maxLength: 20 },
          captchaToken: { type: 'string', maxLength: 4096 },
        },
        anyOf: [{ required: ['email'] }, { required: ['mobile'] }],
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['otp'],
        properties: {
          otp: { type: 'string', minLength: 4, maxLength: 10 },
          email: { type: 'string', format: 'email', maxLength: 254 },
          mobile: { type: 'string', maxLength: 20 },
          flow: { type: 'string', enum: ['signup', 'login', 'password_reset'] },
          purpose: { type: 'string', enum: ['signup', 'login', 'password_reset'] },
        },
        anyOf: [{ required: ['email'] }, { required: ['mobile'] }],
      },
      AdminLoginRequest: {
        type: 'object',
        required: ['userId', 'password'],
        properties: {
          userId: { type: 'string', minLength: 1, maxLength: 64 },
          password: { type: 'string', minLength: 10, maxLength: 128 },
        },
      },
    },
  },
  paths: {
    '/v1/auth/send-otp': {
      post: {
        summary: 'Request OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendOtpRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '429': { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
        },
      },
    },
    '/v1/auth/verify-otp': {
      post: {
        summary: 'Verify OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '429': { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
        },
      },
    },
    '/v1/admin-auth/login': {
      post: {
        summary: 'Superadmin login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminLoginRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          '429': { description: 'Rate limited', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
        },
      },
    },
  },
};

export async function GET() {
  try {
    logger.info('api_docs.audit.openapi_requested');
    return NextResponse.json(spec, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    logger.error('api_docs.audit.openapi_failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to load OpenAPI spec' }, { status: 500 });
  }
}
