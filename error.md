# class vaildation response

```javascript
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "response": {
          "statusCode": 400,
          "message": [
            "Email should not be empty",
            "Eamil is invalid"
          ],
          "error": "Bad Request"
        }
      }
    }
  ],
  "data": null
}
```

# HTTP Exception

```javascript
{
  "errors": [
    {
      "message": "Forbidden",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "getManyUsers"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "response": "Forbidden",
          "status": 403,
          "message": "Forbidden",
          "name": "HttpException"
        }
      }
    }
  ],
  "data": null
}
```

# Query Error

```javascript
{
  "errors": [
    {
      "message": "Cannot query field \"fdsfgds\" on type \"User\".",
      "locations": [
        {
          "line": 6,
          "column": 7
        }
      ],
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ]
}
```
