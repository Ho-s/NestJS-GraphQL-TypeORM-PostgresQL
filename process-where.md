### Equal

    where: {
        user: {
            id: 3
        }
    }

### Equal(explicit)

    where: {
        user: {
            id: {
                $eq: 3
            }
        }
    }

### Contains(case-sensitive)

    where: {
        user: {
            id: {
                $contains: 3
            }
        }
    }

### Not equal

    where: {
        user: {
            id: {
                $ne: 3
            }
        }
    }

### Not Contains(case-sensitive)

    where: {
        user: {
            id: {
                $nContains: 3
            }
        }
    }

### Less than

    where: {
        user: {
            id: {
                $lt: 3
            }
        }
    }

### Is null

    where: {
        user: {
            id: {
                $null: true
            }
        }
    }

### Less than or equal

    where: {
        user: {
            id: {
                $lte: 3
            }
        }
    }

### Is not null

    where: {
        user: {
            id: {
                $nNull: true
            }
        }
    }

### Greater than

    where: {
        user: {
            id: {
                $gt: 3
            }
        }
    }

### Is between

    where: {
        user: {
            id: {
                $between: [3, 4]
            }
        }
    }

### Greater than or equal

    where: {
        user: {
            id: {
                $gte: 3
            }
        }
    }

### Contains(case-insensitive)

    where: {
        user: {
            nickname: {
                $iContains: "man"
            }
        }
    }

### Joins the where in an "or" expression

    where: [
        {
            user: {
                id: 3
            }
        },
        {
            place: {
                id: 3
            }
        }
    ]

### Not Contains(case-insensitive)

    where: {
        user: {
            nickname: {
                $nIContains: "man"
            }
        }
    }

### In

    where: {
        user: {
            id: {
                $in: [1, 2, 3]
            }
        }
    }

### Joins the where in an "and" expression

    where: {
        user: {
            id: 3,
            nickname: "man",
        }
    }

### Not in

    where: {
        user: {
            id: {
                $nIn: [1, 2, 3]
            }
        }
    }

### Matching null

A bare `null` and `$eq: null` both match SQL NULL, and `$ne: null` matches a row
where the column is set.

    where: {
        user: {
            deletedAt: null
        }
    }

### Rejected values

`$in`, `$nIn` and `$between` need an array with no null in it, and `$between`
needs exactly two values. Every other operator except `$eq`, `$ne`, `$null` and
`$nNull` is rejected with a 400 when given null.
