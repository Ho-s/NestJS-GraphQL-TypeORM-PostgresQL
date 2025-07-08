# GraphQL Response Status Codes

- [HTTP Status Codes](#http-status-codes)
  - [✅ 200 OK Responses](#200-ok-responses)
    - [Successful Request](#✅-successful-request)
    - [Partial Success](#⚠️-partial-success-some-data--some-errors)
    - [No Data (e.g., NotFoundErrorException)](#⚠️-no-data-eg-notfounderrorexception)
  - [❌ Non-200 Responses](#non-200-responses)
    - [Bad Request (Invalid JSON, Syntax Error, etc.)](#❌-bad-request-invalid-json-syntax-error-etc)
    - [Authentication/Authorization Failure](#❌-authenticationauthorization-failure)
    - [Unsupported Accept Header](#❌-unsupported-accept-header)
    - [Internal Server Error](#❌-internal-server-error)
- [Summary Table](#summary-table)
- [References](#references)

## HTTP Status Codes

GraphQL generally follows standard HTTP status code conventions, with some GraphQL-specific nuances.

### 200 OK Responses

#### ✅ Successful Request

- **HTTP Status Code**: `200 OK`
- **Data**: Not `null`
- **Errors**: `N/A`

#### ⚠️ Partial Success (Some Data & Some Errors)

- **HTTP Status Code**: `200 OK`
- **Data**: Not `null`
- **Errors**: `Array<GraphQLError>` (length ≥ 1)

#### ⚠️ No Data (e.g., NotFoundErrorException)

When a GraphQL response includes only errors and no data, the [GraphQL over HTTP specification](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#applicationjson) mandates the use of `200 OK`.

- **HTTP Status Code**: `200 OK`
- **Data**: `null`
- **Errors**: `Array<GraphQLError>` (length ≥ 1)

### Non-200(OK) Responses

#### ❌ Bad Request (Invalid JSON, Syntax Error, etc.)

Used when the GraphQL request is malformed or invalid.

- **HTTP Status Code**: `400 Bad Request`
- **Data**: `null`
- **Errors**: `Array<GraphQLError>` (length = 1)

ref: [built-in-error-codes](https://www.apollographql.com/docs/apollo-server/data/errors#built-in-error-codes)

#### ❌ Authentication/Authorization Failure

Used when the request is unauthenticated or the client lacks required permissions.

- **HTTP Status Code**: `401 Unauthorized`, `403 Forbidden`
- **Data**: `null`
- **Errors**: `Array<GraphQLError>` (length = 1)

#### ❌ Unsupported Accept Header

Returned when the request’s `Accept` header does not include `application/graphql-response+json`.

While most GraphQL errors are handled via a custom `formatError`, HTTP-level errors like `406 Not Acceptable` should be handled early (e.g., using middleware and apply globally).

- **HTTP Status Code**: `406 Not Acceptable`
- **Data**: `null`
- **Errors**: `Array<GraphQLError>` (length = 1)

#### ❌ Internal Server Error

Used when an unexpected server-side error or unhandled exception occurs.

- **HTTP Status Code**: `500 Internal Server Error`
- **Data**: `null`
- **Errors**: `Array<GraphQLError>` (length = 1)

## Summary Table

| Scenario                      | HTTP Status | Data | Errors |
| ----------------------------- | ----------- | ---- | ------ |
| Success                       | 200         | ✅   | ❌     |
| Partial Success               | 200         | ✅   | ✅     |
| No Data                       | 200         | ❌   | ✅     |
| Invalid Request (Syntax, etc) | 400         | ❌   | ✅     |
| Auth Failure                  | 401 / 403   | ❌   | ✅     |
| Unsupported Accept Header     | 406         | ❌   | ✅     |
| Internal Server Error         | 500         | ❌   | ✅     |

## References

This error-handling approach follows the [GraphQL over HTTP specification](https://graphql.github.io/graphql-over-http/draft/), which is currently in draft status and subject to change.

- [GraphQL over HTTP - Status Codes](https://graphql.org/learn/serving-over-http/#status-codes)
- [GraphQL Over HTTP Specification (GitHub)](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md)
- [GraphQL over HTTP (Draft)](https://graphql.github.io/graphql-over-http/draft/)
