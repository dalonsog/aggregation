# AggregationJS

Basic aggregation class for JSON-type JavaScript objects.

##Use examples

###Basic aggregation

Given a dataset like:

```javascript
var data = [
 { foo: 1, bar: 1},
 { foo: 1, bar: 2},
 { foo: 1, bar: 2},
 { foo: 2, bar: 1},
 { foo: 2, bar: 1},
 { foo: 2, bar: 2},
 { foo: 2, bar: 3},
 { foo: 2, bar: 3}
];
```

```javascript
aggregate(data, ['foo']) 
```

will return:

```javascript
[
 { foo: 1, count: 3 },
 { foo: 2, count: 5 }
]
```

```javascript
aggregate(data, ['foo', 'bar']) 
```

will return:

```javascript
[
 { foo: 1, bar: 1, count: 1 },
 { foo: 1, bar: 2, count: 2 },
 { foo: 2, bar: 1, count: 2 },
 { foo: 2, bar: 2, count: 1 },
 { foo: 2, bar: 3, count: 2 }
]
```

###Formatting columns

You can format a column return value by passign a mapping function
in the options. Let's see an example:

Given a dataset like:

```javascript
var data = [
 { foo: 1, bar: 1, date: '2016-05-05T12:24:00' },
 { foo: 1, bar: 1, date: '2016-05-05T12:24:00' },
 { foo: 1, bar: 2, date: '2016-05-06T12:24:00' },
 { foo: 2, bar: 1, date: '2016-05-05T12:24:00' },
 { foo: 2, bar: 1, date: '2016-05-05T12:24:00' },
 { foo: 2, bar: 2, date: '2016-05-06T12:24:00' }
];
```

you can group by date and return just the day of the month

```javascript
aggregate(data, ['foo', 'bar', 'date'], { 
   map: { date: e => new Date(e).getDate() } 
});
```

will return:

```javascript
[
 { foo: 1, bar: 1, date: 5, count: 2},
 { foo: 1, bar: 2, date: 6, count: 1},
 { foo: 2, bar: 1, date: 5, count: 2},
 { foo: 2, bar: 2, date: 6, count: 1}
]
```

You can also group by a column not present in the dataset but based on
an operation on one or more original columns with a mapping function.
 
With the previous example data,

```javascript
aggregate(data, ['foobar'], {
  map: { 
    foobar: e => foo + bar
  }
});
```

will return:

```javascript
[
 { foobar: 2, count: 2},
 { foobar: 3, count: 3},
 { foobar: 4, count: 1}
]
```

###Aliases

To give an alias to a grouped column the same way as in any DB language, by
following the structure:

```javascript
<columnName> as <alias>
```

So, with the previous data
aggregate(data, ['foo as foobar', 'bar as barfoo'])
will return:

```javascript
[
 { foobar: 1, barfoo: 1, count: 2},
 { foobar: 1, barfoo: 2, count: 1},
 { foobar: 2, barfoo: 1, count: 2},
 { foobar: 2, barfoo: 2, count: 1}
]
```

*NOTE: to format a column with an alias, the mapping function has to be
assigned to the alias, not the original column name.*
