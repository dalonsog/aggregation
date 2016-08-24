'use strict';

/**
* Basic aggregation class for JSON-type JavaScript objects.
*
* Use example:
*
* Given a dataset like:
*
* var data = [
*   { foo: 1, bar: 1},
*   { foo: 1, bar: 2},
*   { foo: 1, bar: 2},
*   { foo: 2, bar: 1},
*   { foo: 2, bar: 1},
*   { foo: 2, bar: 2},
*   { foo: 2, bar: 3},
*   { foo: 2, bar: 3}
* ];
*
* aggregate(data, ['foo']) will return:
*
* [
*   { foo: 1, count: 3 },
*   { foo: 2, count: 5 }
* ]
*
* aggregate(data, ['foo', 'bar']) will return:
*
* [
*   { foo: 1, bar: 1, count: 1 },
*   { foo: 1, bar: 2, count: 2 },
*   { foo: 2, bar: 1, count: 2 },
*   { foo: 2, bar: 2, count: 1 },
*   { foo: 2, bar: 3, count: 2 }
* ]
*
* You can format a column return value by passign a mapping function
* in the options. Let's see an example:
*
* Given a dataset like:
*
* var data = [
*   { foo: 1, bar: 1, date: '2016-05-05T12:24:00' },
*   { foo: 1, bar: 1, date: '2016-05-05T12:24:00' },
*   { foo: 1, bar: 2, date: '2016-05-06T12:24:00' },
*   { foo: 2, bar: 1, date: '2016-05-05T12:24:00' },
*   { foo: 2, bar: 1, date: '2016-05-05T12:24:00' },
*   { foo: 2, bar: 2, date: '2016-05-06T12:24:00' }
* ];
*
* you can group by date and return just the day of the month
*
* aggregate(data, ['foo', 'bar', 'date'], { 
*     map: { date: e => new Date(e).getDate() } 
* });
*
* will return:
*
* [
*   { foo: 1, bar: 1, date: 5, count: 2},
*   { foo: 1, bar: 2, date: 6, count: 1},
*   { foo: 2, bar: 1, date: 5, count: 2},
*   { foo: 2, bar: 2, date: 6, count: 1}
* ]
*
* You can also group by a column not present in the dataset but based on
* an operation on one or more original columns with a mapping function.
* 
* With the previous example data,
* 
* aggregate(data, ['foobar'], {
*   map: { 
*     foobar: e => foo + bar
*   }
* });
*
* will return:
*
* [
*   { foobar: 2, count: 2},
*   { foobar: 3, count: 3},
*   { foobar: 4, count: 1}
* ]
*
* To give an alias to a grouped column the same way as in any DB language, by
* following the structure:
*
* <columnName> as <alias>
*
* So, with the previous data
*
* aggregate(data, ['foo as foobar', 'bar as barfoo'])
*
* will return:
*
* [
*   { foobar: 1, barfoo: 1, count: 2},
*   { foobar: 1, barfoo: 2, count: 1},
*   { foobar: 2, barfoo: 1, count: 2},
*   { foobar: 2, barfoo: 2, count: 1}
* ]
*
* NOTE: to format a column with an alias, the mapping function has to be
* assigned to the alias, not the original column name.
*
**/

(function (factory) {
  if (typeof define === 'function' && define.amd )
    define([], factory);
  else if (typeof exports === 'object')
    module.exports = factory();
  else
    window.aggregate = factory();
}(function() {
  /**
  ** Main class constructor
  **/
  var Aggregation = function (rawData, keys) {
    this.rawData = rawData;
    this.keys = keys.map(_keyAs);
    this.aggregatedData = [];
    this.options;
  };

  /**
  ** Sets options for the aggregation. If any option is missing, 
  ** a default value would be set
  **
  ** @options: object with the options to set
  **/
  Aggregation.prototype.setOptions = function (options) {
    this.options = { 
      'map': options.map || {},
      'countField': options.countField || 'count'
    };
  };

  /**
  ** Groups the data. 
  **/
  Aggregation.prototype.aggregate = function () {
    this.rawData.forEach(row => {
      var elem = {};
      
      this.keys.slice().forEach(key => {
        elem[key.as] = _map(row, key.raw, this.options.map[key.as]);
      });

      var index = -1;

      for(var i = 0; i < this.aggregatedData.length; i++) {
        var found = true;

        Object.keys(elem).forEach(key => {
          if (elem[key] !== this.aggregatedData[i][key]) found = false;
        });

        if (found) {
          index = i;
          break;
        }
      }

      if (index !== -1) 
        this.aggregatedData[i][this.options.countField]++;
      else {
        elem[this.options.countField] = 1;
        this.aggregatedData.push(elem);
      }
    });
  };

  /**
  ** Auxiliar function for the map option. Maps the [key] attribute of
  ** [elem] with the [fn] mapping function or returns the [key] attribute if
  ** no mapping function is provided.
  **
  ** @elem: object to map
  ** @key: attribute to map
  ** @fn: mapping function
  **
  ** @return: mapped value
  **/
  function _map (elem, key, fn) {
    return fn ? fn(elem) : elem[key];
  }

  function _keyAs (key) {
    var alias = key.split(' as ');
    return { raw: alias[0], as: alias[1] || alias[0]};
  }
  
  /**
  ** Creates a new aggregation and returns the grouped data
  **
  ** @rawData: dataset array to be grouped
  ** @keys: array of key string to group by
  ** @options: optional object with options for the aggregation
  **
  ** @return: aggregated data
  **/
  var _init = function (rawData, keys, options) {
    var agg = new Aggregation(rawData, keys);

    agg.setOptions(options || {});

    agg.aggregate();

    return agg.aggregatedData;
  };

  return _init;
}));
