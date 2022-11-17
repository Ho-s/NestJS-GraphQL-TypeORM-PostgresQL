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
            "email should not be empty",
            "이메일 그거 맞음??"
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
