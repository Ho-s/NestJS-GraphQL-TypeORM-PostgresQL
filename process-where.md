### Equal

    where: {
        user: {
            id: 3
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
                $notNull: true
            }
        }
    }

### Greate than

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

### Joins the where in an "or" expression

    where: [
        user: {
            id: 3
        }
        place: {
            id: 3
        }
    ]

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
