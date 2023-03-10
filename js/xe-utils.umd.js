/**
 * xe-utils.js v2.8.3
 * MIT License.
 * @preserve
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
      : (global.XEUtils = factory())
}(this, function () {
  'use strict'

  var formatString = 'yyyy-MM-dd HH:mm:ss'
  var setupDefaults = {
    treeOptions: {
      parentKey: 'parentId',
      key: 'id',
      children: 'children'
    },
    formatDate: formatString + '.SSSZ',
    formatString: formatString,
    dateDiffRules: [
      ['yyyy', 31536000000],
      ['MM', 2592000000],
      ['dd', 86400000],
      ['HH', 3600000],
      ['mm', 60000],
      ['ss', 1000],
      ['S', 0]
    ]
  }

  function mixin () {
    arrayEach(arguments, function (methods) {
      each(methods, function (fn, name) {
        XEUtils[name] = isFunction(fn) ? function () {
          var result = fn.apply(XEUtils.$context, arguments)
          XEUtils.$context = null
          return result
        } : fn
      })
    })
  }

  function setup (options) {
    return assign(setupDefaults, options)
  }

  function XEUtils () {}

  XEUtils.v = 'v2'
  XEUtils.mixin = mixin
  XEUtils.setup = setup

  var staticStrUndefined = 'undefined'

  var staticStrLast = 'last'

  var staticStrFirst = 'first'

  var staticDayTime = 86400000

  var staticWeekTime = staticDayTime * 7

  /* eslint-disable valid-typeof */
  var staticLocation = typeof location === staticStrUndefined ? 0 : location

  /* eslint-disable valid-typeof */
  var staticWindow = typeof window === staticStrUndefined ? 0 : window

  /* eslint-disable valid-typeof */
  var staticDocument = typeof document === staticStrUndefined ? 0 : document

  var staticEncodeURIComponent = encodeURIComponent

  var staticDecodeURIComponent = decodeURIComponent

  var objectToString = Object.prototype.toString

  var staticParseInt = parseInt

  var staticEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  }

  var staticHGKeyRE = /(.+)?\[(\d+)\]$/

  var objectAssignFns = Object.assign

  function handleAssign (destination, args, isClone) {
    var len = args.length
    for (var source, index = 1; index < len; index++) {
      source = args[index]
      arrayEach(keys(args[index]), isClone ? function (key) {
        destination[key] = clone(source[key], isClone)
      } : function (key) {
        destination[key] = source[key]
      })
    }
    return destination
  }

  /**
  * ???????????????????????????????????????????????????
  *
  * @param {Object} target ????????????
  * @param {...Object}
  * @return {Boolean}
  */
  var assign = function (target) {
    if (target) {
      var args = arguments
      if (target === true) {
        if (args.length > 1) {
          target = isArray(target[1]) ? [] : {}
          return handleAssign(target, args, true)
        }
      } else {
        return objectAssignFns ? objectAssignFns.apply(Object, args) : handleAssign(target, args)
      }
    }
    return target
  }

  /**
 * ???????????????????????? assign ??????
 * @param target ????????????
 * @param sources ????????????
*/
  var extend = assign

  /**
  * ?????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function objectMap (obj, iterate, context) {
    var result = {}
    if (obj) {
      if (iterate) {
        if (!isFunction(iterate)) {
          iterate = property(iterate)
        }
        each(obj, function (val, index) {
          result[index] = iterate.call(context, val, index, obj)
        })
      } else {
        return obj
      }
    }
    return result
  }

  function objectEach (obj, iterate, context) {
    if (obj) {
      for (var key in obj) {
        if (hasOwnProp(obj, key)) {
          iterate.call(context, obj[key], key, obj)
        }
      }
    }
  }

  function lastObjectEach (obj, iterate, context) {
    lastArrayEach(keys(obj), function (key) {
      iterate.call(context, obj[key], key, obj)
    })
  }

  function handleMerge (target, source) {
    if ((isPlainObject(target) && isPlainObject(source)) || (isArray(target) && isArray(source))) {
      each(source, function (obj, key) {
        target[key] = handleMerge(target[key], obj)
      })
      return target
    }
    return source
  }

  /**
  * ???????????????????????????????????????????????????
  *
  * @param {Object} target ????????????
  * @param {...Object}
  * @return {Boolean}
  */
  var merge = function (target) {
    if (!target) {
      target = {}
    }
    var args = arguments
    var len = args.length
    for (var source, index = 1; index < len; index++) {
      source = args[index]
      if (source) {
        handleMerge(target, source)
      }
    }
    return target
  }

  /**
  * ????????????
  *
  * @param {Array} array ??????
  * @return {Array}
  */
  function uniq (array) {
    var result = []
    each(array, function (value) {
      if (!includes(result, value)) {
        result.push(value)
      }
    })
    return result
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {...Array} ??????
  * @return {Array}
  */
  function union () {
    var args = arguments
    var result = []
    var index = 0
    var len = args.length
    for (; index < len; index++) {
      result = result.concat(toArray(args[index]))
    }
    return uniq(result)
  }

  var sortBy = orderBy

  var ORDER_PROP_ASC = 'asc'
  var ORDER_PROP_DESC = 'desc'

  // function handleSort (v1, v2) {
  //   return v1 > v2 ? 1 : -1
  // }

  // '' < ?????? < ?????? < null < undefined
  function handleSort (v1, v2) {
    if (isUndefined(v1)) {
      return 1
    }
    if (isNull(v1)) {
      return isUndefined(v2) ? -1 : 1
    }
    return v1 && v1.localeCompare ? v1.localeCompare(v2) : (v1 > v2 ? 1 : -1)
  }

  function buildMultiOrders (name, confs, compares) {
    return function (item1, item2) {
      var v1 = item1[name]
      var v2 = item2[name]
      if (v1 === v2) {
        return compares ? compares(item1, item2) : 0
      }
      return confs.order === ORDER_PROP_DESC ? handleSort(v2, v1) : handleSort(v1, v2)
    }
  }

  function getSortConfs (arr, list, fieldConfs, context) {
    var sortConfs = []
    fieldConfs = isArray(fieldConfs) ? fieldConfs : [fieldConfs]
    arrayEach(fieldConfs, function (handle, index) {
      if (handle) {
        var field = handle
        var order
        if (isArray(handle)) {
          field = handle[0]
          order = handle[1]
        } else if (isPlainObject(handle)) {
          field = handle.field
          order = handle.order
        }
        sortConfs.push({
          field: field,
          order: order || ORDER_PROP_ASC
        })
        arrayEach(list, isFunction(field) ? function (item, key) {
          item[index] = field.call(context, item.data, key, arr)
        } : function (item) {
          item[index] = field ? get(item.data, field) : item.data
        })
      }
    })
    return sortConfs
  }

  /**
  * ?????????????????????
  *
  * @param {Array} arr ??????
  * @param {Function/String/Array} fieldConfs ???????????????
  * @param {Object} context ?????????
  * @return {Array}
  */
  function orderBy (arr, fieldConfs, context) {
    if (arr) {
      if (eqNull(fieldConfs)) {
        return toArray(arr).sort(handleSort)
      }
      var compares
      var list = map(arr, function (item) {
        return { data: item }
      })
      var sortConfs = getSortConfs(arr, list, fieldConfs, context)
      var len = sortConfs.length - 1
      while (len >= 0) {
        compares = buildMultiOrders(len, sortConfs[len], compares)
        len--
      }
      if (compares) {
        list = list.sort(compares)
      }
      return map(list, property('data'))
    }
    return []
  }

  /**
  * ??????????????????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @return {Array}
  */
  function shuffle (array) {
    var index
    var result = []
    var list = values(array)
    var len = list.length - 1
    for (; len >= 0; len--) {
      index = len > 0 ? random(0, len) : 0
      result.push(list[index])
      list.splice(index, 1)
    }
    return result
  }

  /**
  * ??????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Number} number ??????
  * @return {Array}
  */
  function sample (array, number) {
    var result = shuffle(array)
    if (arguments.length <= 1) {
      return result[0]
    }
    if (number < result.length) {
      result.length = number || 0
    }
    return result
  }

  /**
  * ????????????????????????????????????????????????,??????????????????????????????true,?????????true,????????????false
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Boolean}
  */
  var some = helperCreateIterateHandle('some', 1, 0, true, false)

  /**
  * ????????????????????????????????????????????????,????????????????????????????????????true,?????????true,????????????false
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Boolean}
  */
  var every = helperCreateIterateHandle('every', 1, 1, false, true)

  /**
 * ?????? Arguments ????????? array?????? start ??????????????? end ????????????????????? end ???????????????
 * @param {Array/Arguments} array ?????????Arguments
 * @param {Number} startIndex ????????????
 * @param {Number} endIndex ????????????
 */
  function slice (array, startIndex, endIndex) {
    var result = []
    var argsSize = arguments.length
    if (array) {
      startIndex = argsSize >= 2 ? toNumber(startIndex) : 0
      endIndex = argsSize >= 3 ? toNumber(endIndex) : array.length
      if (array.slice) {
        return array.slice(startIndex, endIndex)
      }
      for (; startIndex < endIndex; startIndex++) {
        result.push(array[startIndex])
      }
    }
    return result
  }

  /**
  * ????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function filter (obj, iterate, context) {
    var result = []
    if (obj && iterate) {
      if (obj.filter) {
        return obj.filter(iterate, context)
      }
      each(obj, function (val, key) {
        if (iterate.call(context, val, key, obj)) {
          result.push(val)
        }
      })
    }
    return result
  }

  /**
  * ???????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  var find = helperCreateIterateHandle('find', 1, 3, true)

  /**
  * ????????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function findLast (obj, iterate, context) {
    if (obj) {
      if (!isArray(obj)) {
        obj = values(obj)
      }
      for (var len = obj.length - 1; len >= 0; len--) {
        if (iterate.call(context, obj[len], len, obj)) {
          return obj[len]
        }
      }
    }
  }

  /**
  * ?????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  var findKey = helperCreateIterateHandle('', 0, 2, true)

  /**
  * ??????????????????????????????,????????????true??????false
  *
  * @param {Object} obj ??????
  * @param {Object} val ???
  * @return {Boolean}
  */
  function includes (obj, val) {
    return indexOf(obj, val) !== -1
  }

  function arrayIndexOf (obj, val) {
    if (obj.indexOf) {
      return obj.indexOf(val)
    }
    for (var index = 0, len = obj.length; index < len; index++) {
      if (val === obj[index]) {
        return index
      }
    }
  }

  function arrayLastIndexOf (obj, val) {
    if (obj.lastIndexOf) {
      return obj.lastIndexOf(val)
    }
    for (var len = obj.length - 1; len >= 0; len--) {
      if (val === obj[len]) {
        return len
      }
    }
    return -1
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Array}
  */
  function map (obj, iterate, context) {
    var result = []
    if (obj && arguments.length > 1) {
      if (obj.map) {
        return obj.map(iterate, context)
      } else {
        each(obj, function () {
          result.push(iterate.apply(context, arguments))
        })
      }
    }
    return result
  }

  /**
  * ???????????????????????????????????????????????????????????????????????????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Function} callback ??????
  * @param {Object} initialValue ?????????
  * @return {Number}
  */
  function reduce (array, callback, initialValue) {
    if (array) {
      var len, reduceMethod
      var index = 0
      var context = null
      var previous = initialValue
      var isInitialVal = arguments.length > 2
      var keyList = keys(array)
      if (array.length && array.reduce) {
        reduceMethod = function () {
          return callback.apply(context, arguments)
        }
        if (isInitialVal) {
          return array.reduce(reduceMethod, previous)
        }
        return array.reduce(reduceMethod)
      }
      if (isInitialVal) {
        index = 1
        previous = array[keyList[0]]
      }
      for (len = keyList.length; index < len; index++) {
        previous = callback.call(context, previous, array[keyList[index]], index, array)
      }
      return previous
    }
  }

  /**
  * ???????????????????????????????????????????????????????????????,??????????????????
  *
  * @param {Array} array ??????
  * @param {Number} target ??????????????????????????????
  * @param {Number} start ?????????????????????????????????????????? 0 ?????????????????????????????????
  * @param {Number} end ?????????????????????????????????????????????????????????????????????????????????????????????
  * @return {Array}
  */
  function copyWithin (array, target, start, end) {
    if (isArray(array) && array.copyWithin) {
      return array.copyWithin(target, start, end)
    }
    var replaceIndex, replaceArray
    var targetIndex = target >> 0
    var startIndex = start >> 0
    var len = array.length
    var endIndex = arguments.length > 3 ? end >> 0 : len
    if (targetIndex < len) {
      targetIndex = targetIndex >= 0 ? targetIndex : len + targetIndex
      if (targetIndex >= 0) {
        startIndex = startIndex >= 0 ? startIndex : len + startIndex
        endIndex = endIndex >= 0 ? endIndex : len + endIndex
        if (startIndex < endIndex) {
          for (replaceIndex = 0, replaceArray = array.slice(startIndex, endIndex); targetIndex < len; targetIndex++) {
            if (replaceArray.length <= replaceIndex) {
              break
            }
            array[targetIndex] = replaceArray[replaceIndex++]
          }
        }
      }
    }
    return array
  }

  /**
  * ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Number} size ????????????
  * @return {Array}
  */
  function chunk (array, size) {
    var index
    var result = []
    var arrLen = size >> 0 || 1
    if (isArray(array)) {
      if (arrLen >= 0 && array.length > arrLen) {
        index = 0
        while (index < array.length) {
          result.push(array.slice(index, index + arrLen))
          index += arrLen
        }
      } else {
        result = array.length ? [array] : array
      }
    }
    return result
  }

  /**
 * ???????????????????????????????????????????????????
 *
 * @param {Array*} array ??????
 */
  function zip () {
    return unzip(arguments)
  }

  /**
 * ??? zip ??????
 *
 * @param {Array} arrays ????????????
 */
  function unzip (arrays) {
    var index, maxItem, len
    var result = []
    if (arrays && arrays.length) {
      index = 0
      maxItem = max(arrays, function (item) {
        return item ? item.length : 0
      })
      for (len = maxItem ? maxItem.length : 0; index < len; index++) {
        result.push(pluck(arrays, index))
      }
    }
    return result
  }

  /**
 * ?????????????????????????????????????????????
 *
 * @param {Array} props ?????????
 * @param {Number} arr ?????????
 * @return {Object}
 */
  function zipObject (props, arr) {
    var result = {}
    arr = arr || []
    each(values(props), function (val, key) {
      result[val] = arr[key]
    })
    return result
  }

  function flattenDeep (array, deep) {
    var result = []
    arrayEach(array, function (vals) {
      result = result.concat(isArray(vals) ? (deep ? flattenDeep(vals, deep) : vals) : [vals])
    })
    return result
  }

  /**
  * ???????????????????????????
  * @param {Array} array ??????
  * @param {Boolean} deep ????????????
  * @return {Array}
  */
  function flatten (array, deep) {
    if (isArray(array)) {
      return flattenDeep(array, deep)
    }
    return []
  }

  /**
 * ???????????????????????????????????????
 *
 * @param {Array} obj ??????
 * @return {Array}
 */
  function toArray (array) {
    return map(array, function (item) {
      return item
    })
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Array} array1 ??????
  * @param {Array} array2 ???????????????
  * @return {Boolean}
  */
  function includeArrays (array1, array2) {
    var len
    var index = 0
    if (isArray(array1) && isArray(array2)) {
      for (len = array2.length; index < len; index++) {
        if (!includes(array1, array2[index])) {
          return false
        }
      }
      return true
    }
    return includes(array1, array2)
  }

  /**
  * ??????????????????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {String} key ?????????
  * @return {Array}
  */
  function pluck (obj, key) {
    return map(obj, property(key))
  }

  function deepGetObj (obj, path) {
    var index = 0
    var len = path.length
    while (obj && index < len) {
      obj = obj[path[index++]]
    }
    return len && obj ? obj : 0
  }

  /**
 * ???list??????????????????????????????,?????????????????????????????????????????????????????????????????????
 *
 * @param {Array} list
 * @param {Array/String/Function} path
 * @param {...Object} arguments
 * @return {Array}
 */
  function invoke (list, path) {
    var func
    var args = arguments
    var params = []
    var paths = []
    var index = 2
    var len = args.length
    for (; index < len; index++) {
      params.push(args[index])
    }
    if (isArray(path)) {
      len = path.length - 1
      for (index = 0; index < len; index++) {
        paths.push(path[index])
      }
      path = path[len]
    }
    return map(list, function (context) {
      if (paths.length) {
        context = deepGetObj(context, paths)
      }
      func = context[path] || path
      if (func && func.apply) {
        return func.apply(context, params)
      }
    })
  }

  var invokeMap = invoke

  function arrayEach (obj, iterate, context) {
    if (obj) {
      if (obj.forEach) {
        obj.forEach(iterate, context)
      } else {
        for (var index = 0, len = obj.length; index < len; index++) {
          iterate.call(context, obj[index], index, obj)
        }
      }
    }
  }

  function lastArrayEach (obj, iterate, context) {
    for (var len = obj.length - 1; len >= 0; len--) {
      iterate.call(context, obj[len], len, obj)
    }
  }

  function strictTree (array, optChildren) {
    each(array, function (item) {
      if (item.children && !item.children.length) {
        remove(item, optChildren)
      }
    })
  }

  /**
  * ????????????????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Object} options {strict: false, parentKey: 'parentId', key: 'id', children: 'children', data: 'data'}
  * @return {Array}
  */
  function toArrayTree (array, options) {
    var opts = assign({}, setupDefaults.treeOptions, options)
    var optStrict = opts.strict
    var optKey = opts.key
    var optParentKey = opts.parentKey
    var optChildren = opts.children
    var optSortKey = opts.sortKey
    var optReverse = opts.reverse
    var optData = opts.data
    var result = []
    var treeMap = {}
    var idList, id, treeData, parentId

    if (optSortKey) {
      array = orderBy(clone(array), optSortKey)
      if (optReverse) {
        array = array.reverse()
      }
    }

    idList = map(array, function (item) {
      return item[optKey]
    })

    each(array, function (item) {
      id = item[optKey]

      if (optData) {
        treeData = {}
        treeData[optData] = item
      } else {
        treeData = item
      }

      parentId = item[optParentKey]
      treeMap[id] = treeMap[id] || []
      treeMap[parentId] = treeMap[parentId] || []
      treeMap[parentId].push(treeData)
      treeData[optKey] = id
      treeData[optParentKey] = parentId
      treeData[optChildren] = treeMap[id]

      if (!optStrict || (optStrict && !parentId)) {
        if (!includes(idList, parentId)) {
          result.push(treeData)
        }
      }
    })

    if (optStrict) {
      strictTree(array, optChildren)
    }

    return result
  }

  function unTreeList (result, array, opts) {
    var optChildren = opts.children
    var optData = opts.data
    var optClear = opts.clear
    each(array, function (item) {
      var children = item[optChildren]
      if (optData) {
        item = item[optData]
      }
      result.push(item)
      if (children && children.length) {
        unTreeList(result, children, opts)
      }
      if (optClear) {
        delete item[optChildren]
      }
    })
    return result
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Object} options {children: 'children', data: 'data'}
  * @return {Array}
  */
  function toTreeArray (array, options) {
    return unTreeList([], array, assign({}, setupDefaults.treeOptions, options))
  }

  function findTreeItem (parent, obj, iterate, context, path, node, parseChildren, opts) {
    if (obj) {
      var item, index, len, paths, nodes, match
      for (index = 0, len = obj.length; index < len; index++) {
        item = obj[index]
        paths = path.concat(['' + index])
        nodes = node.concat([item])
        if (iterate.call(context, item, index, obj, paths, parent, nodes)) {
          return { index: index, item: item, path: paths, items: obj, parent: parent, nodes: nodes }
        }
        if (parseChildren && item) {
          match = findTreeItem(item, item[parseChildren], iterate, context, paths.concat([parseChildren]), nodes, parseChildren, opts)
          if (match) {
            return match
          }
        }
      }
    }
  }

  /**
  * ???????????????????????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, items, path, parent, nodes) ??????
  * @param {Object} options {children: 'children'}
  * @param {Object} context ?????????
  * @return {Object} { item, index, items, path, parent, nodes }
  */
  var findTree = helperCreateTreeFunc(findTreeItem)

  function eachTreeItem (parent, obj, iterate, context, path, node, parseChildren, opts) {
    var paths, nodes
    each(obj, function (item, index) {
      paths = path.concat(['' + index])
      nodes = node.concat([item])
      iterate.call(context, item, index, obj, paths, parent, nodes)
      if (item && parseChildren) {
        paths.push(parseChildren)
        eachTreeItem(item, item[parseChildren], iterate, context, paths, nodes, parseChildren, opts)
      }
    })
  }

  /**
  * ????????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, items, path, parent, nodes) ??????
  * @param {Object} options {children: 'children', mapChildren: 'children}
  * @param {Object} context ?????????
  */
  var eachTree = helperCreateTreeFunc(eachTreeItem)

  function mapTreeItem (parent, obj, iterate, context, path, node, parseChildren, opts) {
    var paths, nodes, rest
    var mapChildren = opts.mapChildren || parseChildren
    return map(obj, function (item, index) {
      paths = path.concat(['' + index])
      nodes = node.concat([item])
      rest = iterate.call(context, item, index, obj, paths, parent, nodes)
      if (rest && item && parseChildren && item[parseChildren]) {
        rest[mapChildren] = mapTreeItem(item, item[parseChildren], iterate, context, paths, nodes, parseChildren, opts)
      }
      return rest
    })
  }

  /**
  * ????????????????????????????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, items, path, parent, nodes) ??????
  * @param {Object} options {children: 'children'}
  * @param {Object} context ?????????
  * @return {Object/Array}
  */
  var mapTree = helperCreateTreeFunc(mapTreeItem)

  /**
  * ???????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, items, path, parent) ??????
  * @param {Object} options {children: 'children'}
  * @param {Object} context ?????????
  * @return {Array}
  */
  function filterTree (obj, iterate, options, context) {
    var result = []
    if (obj && iterate) {
      eachTree(obj, function (item, index, items, path, parent, nodes) {
        if (iterate.call(context, item, index, items, path, parent, nodes)) {
          result.push(item)
        }
      }, options)
    }
    return result
  }

  function searchTreeItem (parentAllow, parent, obj, iterate, context, path, node, parseChildren, opts) {
    var paths, nodes, rest, isAllow, hasChild
    var rests = []
    var hasOriginal = opts.original
    var sourceData = opts.data
    var mapChildren = opts.mapChildren || parseChildren
    arrayEach(obj, function (item, index) {
      paths = path.concat(['' + index])
      nodes = node.concat([item])
      isAllow = parentAllow || iterate.call(context, item, index, obj, paths, parent, nodes)
      hasChild = parseChildren && item[parseChildren]
      if (isAllow || hasChild) {
        if (hasOriginal) {
          rest = item
        } else {
          rest = assign({}, item)
          if (sourceData) {
            rest[sourceData] = item
          }
        }
        rest[mapChildren] = searchTreeItem(isAllow, item, item[parseChildren], iterate, context, paths, nodes, parseChildren, opts)
        if (isAllow || rest[mapChildren].length) {
          rests.push(rest)
        }
      } else if (isAllow) {
        rests.push(rest)
      }
    })
    return rests
  }

  /**
  * ???????????????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, items, path, parent, nodes) ??????
  * @param {Object} options {children: 'children'}
  * @param {Object} context ?????????
  * @return {Array}
  */
  var searchTree = helperCreateTreeFunc(function (parent, obj, iterate, context, path, nodes, parseChildren, opts) {
    return searchTreeItem(0, parent, obj, iterate, context, path, nodes, parseChildren, opts)
  })

  function helperCreateIterateHandle (prop, useArray, restIndex, matchValue, defaultValue) {
    return function (obj, iterate, context) {
      if (obj && iterate) {
        if (prop && obj[prop]) {
          return obj[prop](iterate, context)
        } else {
          if (useArray && isArray(obj)) {
            for (var index = 0, len = obj.length; index < len; index++) {
              if (!!iterate.call(context, obj[index], index, obj) === matchValue) {
                return [true, false, index, obj[index]][restIndex]
              }
            }
          } else {
            for (var key in obj) {
              if (hasOwnProp(obj, key)) {
                if (!!iterate.call(context, obj[key], key, obj) === matchValue) {
                  return [true, false, key, obj[key]][restIndex]
                }
              }
            }
          }
        }
      }
      return defaultValue
    }
  }

  function helperCreateTreeFunc (handle) {
    return function (obj, iterate, options, context) {
      var opts = options || {}
      var optChildren = opts.children || 'children'
      return handle(null, obj, iterate, context, [], [], optChildren, opts)
    }
  }

  /**
  * ??????????????????????????????????????????????????????
  *
  * @param {Object} obj ??????
  * @param {String/Number} key ??????
  * @return {Boolean}
  */
  function hasOwnProp (obj, key) {
    return obj && obj.hasOwnProperty ? obj.hasOwnProperty(key) : false
  }

  /**
 * ???????????? undefined ??? null
 * @param {Object} obj ??????
 * @return {Boolean}
 */
  function eqNull (obj) {
    return isNull(obj) || isUndefined(obj)
  }

  /* eslint-disable eqeqeq */
  function isNumberNaN (obj) {
    return isNumber(obj) && isNaN(obj)
  }

  function isNumberFinite (obj) {
    return isNumber(obj) && isFinite(obj)
  }

  /**
  * ????????????Undefined
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isUndefined = helperCreateInTypeof(staticStrUndefined)

  /**
  * ??????????????????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isArray = Array.isArray || helperCreateInInObjectString('Array')

  /**
  * ??????????????????
  *
  * @param {Number} obj ??????
  * @return {Boolean}
  */
  function isFloat (obj) {
    return !isNull(obj) && !isNaN(obj) && !isArray(obj) && !isInteger(obj)
  }

  /**
  * ??????????????????
  *
  * @param {Number, String} number ??????
  * @return {Boolean}
  */
  var isInteger = function (obj) {
    return !isNull(obj) && !isNaN(obj) && !isArray(obj) && obj % 1 === 0
  }

  /**
  * ??????????????????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isFunction = helperCreateInTypeof('function')

  /**
  * ????????????Boolean??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isBoolean = helperCreateInTypeof('boolean')

  /**
  * ????????????String??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isString = helperCreateInTypeof('string')

  /**
  * ????????????Number??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isNumber = helperCreateInTypeof('number')

  /**
  * ????????????RegExp??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isRegExp = helperCreateInInObjectString('RegExp')

  /**
  * ????????????Object??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isObject = helperCreateInTypeof('object')

  /**
  * ??????????????????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isPlainObject (obj) {
    return obj ? obj.constructor === Object : false
  }

  /**
  * ????????????Date??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isDate = helperCreateInInObjectString('Date')

  /**
  * ????????????Error??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isError = helperCreateInInObjectString('Error')

  /**
  * ????????????TypeError??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isTypeError (obj) {
    return obj ? obj.constructor === TypeError : false
  }

  /**
  * ????????????????????????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isEmpty (obj) {
    for (var key in obj) {
      return false
    }
    return true
  }

  /**
  * ???????????????Null
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isNull (obj) {
    return obj === null
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????Symbol??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var supportSymbol = typeof Symbol !== staticStrUndefined
  function isSymbol (obj) {
    return supportSymbol && Symbol.isSymbol ? Symbol.isSymbol(obj) : (typeof obj === 'symbol')
  }

  /**
  * ????????????Arguments??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var isArguments = helperCreateInInObjectString('Arguments')

  /**
  * ????????????Element??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isElement (obj) {
    return !!(obj && isString(obj.nodeName) && isNumber(obj.nodeType))
  }

  /**
  * ????????????Document??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isDocument (obj) {
    return !!(obj && staticDocument && obj.nodeType === 9)
  }

  /**
  * ????????????Window??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  function isWindow (obj) {
    return staticWindow && !!(obj && obj === obj.window)
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????FormData??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
  */
  var supportFormData = typeof FormData !== staticStrUndefined
  function isFormData (obj) {
    return supportFormData && obj instanceof FormData
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????Map??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
 */
  var supportMap = typeof Map !== staticStrUndefined
  function isMap (obj) {
    return supportMap && obj instanceof Map
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????WeakMap??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
 */
  var supportWeakMap = typeof WeakMap !== staticStrUndefined
  function isWeakMap (obj) {
    return supportWeakMap && obj instanceof WeakMap
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????Set??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
 */
  var supportSet = typeof Set !== staticStrUndefined
  function isSet (obj) {
    return supportSet && obj instanceof Set
  }

  /* eslint-disable valid-typeof */

  /**
  * ????????????WeakSet??????
  *
  * @param {Object} obj ??????
  * @return {Boolean}
 */
  var supportWeakSet = typeof WeakSet !== staticStrUndefined
  function isWeakSet (obj) {
    return supportWeakSet && obj instanceof WeakSet
  }

  /**
  * ??????????????????
  *
  * @param {Date} date ???????????????
  * @return {Boolean}
  */
  function isLeapYear (date) {
    var year
    var currentDate = date ? toStringDate(date) : helperNewDate()
    if (isDate(currentDate)) {
      year = currentDate.getFullYear()
      return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0)
    }
    return false
  }

  /**
 * ???????????????????????????????????????????????????
 *
 * @param {Object/Array} obj ??????
 * @param {Object} source ???
 * @return {Boolean}
 */
  function isMatch (obj, source) {
    var objKeys = keys(obj)
    var sourceKeys = keys(source)
    if (sourceKeys.length) {
      if (includeArrays(objKeys, sourceKeys)) {
        return some(sourceKeys, function (key2) {
          return findIndexOf(objKeys, function (key1) {
            return key1 === key2 && isEqual(obj[key1], source[key2])
          }) > -1
        })
      }
    } else {
      return true
    }
    return isEqual(obj, source)
  }

  /**
 * ????????????????????????????????????????????????
 *
 * @param {Object} obj1 ???1
 * @param {Object} obj2 ???2
 * @return {Boolean}
 */
  function isEqual (obj1, obj2) {
    return helperEqualCompare(obj1, obj2, helperDefaultCompare)
  }

  /**
 * ??????????????????????????????????????????????????????????????????????????????
 *
 * @param {Object} obj1 ???1
 * @param {Object} obj2 ???2
 * @param {Function} func ???????????????
 * @return {Boolean}
 */
  function isEqualWith (obj1, obj2, func) {
    if (isFunction(func)) {
      return helperEqualCompare(obj1, obj2, function (v1, v2, key, obj1, obj2) {
        var result = func(v1, v2, key, obj1, obj2)
        return isUndefined(result) ? helperDefaultCompare(v1, v2) : !!result
      }, func)
    }
    return helperEqualCompare(obj1, obj2, helperDefaultCompare)
  }

  /**
  * ??????????????????
  *
  * @param {Object} obj ??????
  * @return {String}
  */
  function getType (obj) {
    if (isNull(obj)) {
      return 'null'
    }
    if (isSymbol(obj)) {
      return 'symbol'
    }
    if (isDate(obj)) {
      return 'date'
    }
    if (isArray(obj)) {
      return 'array'
    }
    if (isRegExp(obj)) {
      return 'regexp'
    }
    if (isError(obj)) {
      return 'error'
    }
    return typeof obj
  }

  /**
  * ??????????????????????????????
  *
  * @param {String} prefix ??????
  * @return {Number}
  */
  var __uniqueId = 0
  function uniqueId (prefix) {
    return [prefix, ++__uniqueId].join('')
  }

  /**
  * ?????????????????????
  *
  * @param {Object} obj ??????
  * @return {Number}
  */
  function getSize (obj) {
    var len = 0
    if (isString(obj) || isArray(obj)) {
      return obj.length
    }
    each(obj, function () {
      len++
    })
    return len
  }

  /**
  * ??????????????????????????????
  *
  * @param {Object} obj ??????
  * @param {Object} val ???
  * @return {Number}
  */
  var indexOf = helperCreateIndexOf('indexOf', arrayIndexOf)

  /**
  * ???????????????????????????,??????????????????????????????
  *
  * @param {Object} array ??????
  * @param {Object} val ???
  * @return {Number}
  */
  var lastIndexOf = helperCreateIndexOf('lastIndexOf', arrayLastIndexOf)

  /**
  * ??????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  var findIndexOf = helperCreateiterateIndexOf(function (obj, iterate, context) {
    for (var index = 0, len = obj.length; index < len; index++) {
      if (iterate.call(context, obj[index], index, obj)) {
        return index
      }
    }
    return -1
  })

  /**
  * ???????????????????????????,??????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  var findLastIndexOf = helperCreateiterateIndexOf(function (obj, iterate, context) {
    for (var len = obj.length - 1; len >= 0; len--) {
      if (iterate.call(context, obj[len], len, obj)) {
        return len
      }
    }
    return -1
  })

  /**
  * ????????????JSON
  *
  * @param {String} str ?????????
  * @return {Object} ?????????????????????
  */
  function toStringJSON (str) {
    if (isObject(str)) {
      return str
    } else if (isString(str)) {
      try {
        return JSON.parse(str)
      } catch (e) {}
    }
    return {}
  }

  /**
  * JSON????????????
  *
  * @param {Object} obj ??????
  * @return {String} ???????????????
  */
  function toJSONString (obj) {
    return JSON.stringify(obj) || ''
  }

  /**
  * ????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @return {Array}
  */
  var keys = helperCreateGetObjects('keys', 1)

  /**
  * ?????????????????????
  *
  * @param {Object} obj ??????/??????
  * @return {Array}
  */
  var values = helperCreateGetObjects('values', 0)

  /**
  * ??????????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @return {Array}
  */
  var entries = helperCreateGetObjects('entries', 2)

  /**
 * ?????? key ???????????????????????????????????????????????????
 *
 * @param {Object} obj ??????
 * @param {String/Array} key ?????????
 * @return {Object}
 */
  var pick = helperCreatePickOmit(1, 0)

  /**
 * ?????? key ???????????????????????????????????????????????????
 *
 * @param {Object} obj ??????
 * @param {String/Array} key ?????????
 * @return {Object}
 */
  var omit = helperCreatePickOmit(0, 1)

  /**
  * ????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @return {Object}
  */
  function first (obj) {
    return values(obj)[0]
  }

  /**
  * ???????????????????????????
  *
  * @param {Object} obj ??????/??????
  * @return {Object}
  */
  function last (obj) {
    var list = values(obj)
    return list[list.length - 1]
  }

  /**
  * ?????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function each (obj, iterate, context) {
    if (obj) {
      return (isArray(obj) ? arrayEach : objectEach)(obj, iterate, context)
    }
    return obj
  }

  /**
  * ?????????,?????? return false ???????????? break
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function forOf (obj, iterate, context) {
    if (obj) {
      if (isArray(obj)) {
        for (var index = 0, len = obj.length; index < len; index++) {
          if (iterate.call(context, obj[index], index, obj) === false) {
            break
          }
        }
      } else {
        for (var key in obj) {
          if (hasOwnProp(obj, key)) {
            if (iterate.call(context, obj[key], key, obj) === false) {
              break
            }
          }
        }
      }
    }
  }

  /**
  * ?????????,?????????????????????,?????? return false ???????????? break
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function lastForOf (obj, iterate, context) {
    if (obj) {
      var len, list
      if (isArray(obj)) {
        for (len = obj.length - 1; len >= 0; len--) {
          if (iterate.call(context, obj[len], len, obj) === false) {
            break
          }
        }
      } else {
        list = keys(obj)
        for (len = list.length - 1; len >= 0; len--) {
          if (iterate.call(context, obj[list[len]], list[len], obj) === false) {
            break
          }
        }
      }
    }
  }

  /**
  * ?????????,?????????????????????
  *
  * @param {Object} obj ??????/??????
  * @param {Function} iterate(item, index, obj) ??????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function lastEach (obj, iterate, context) {
    if (obj) {
      return (isArray(obj) ? lastArrayEach : lastObjectEach)(obj, iterate, context)
    }
    return obj
  }

  /**
 * ?????????????????????????????????????????????
 *
 * @param {Object/Array} data ??????
 * @param {String/Function} property ????????????
 * @return {Boolean}
 */
  function has (obj, property) {
    if (obj) {
      if (hasOwnProp(obj, property)) {
        return true
      } else {
        var prop, arrIndex, objProp, matchs, rest, isHas
        var props = helperGetHGSKeys(property)
        var index = 0
        var len = props.length
        for (rest = obj; index < len; index++) {
          isHas = false
          prop = props[index]
          matchs = prop ? prop.match(staticHGKeyRE) : ''
          if (matchs) {
            arrIndex = matchs[1]
            objProp = matchs[2]
            if (arrIndex) {
              if (rest[arrIndex]) {
                if (hasOwnProp(rest[arrIndex], objProp)) {
                  isHas = true
                  rest = rest[arrIndex][objProp]
                }
              }
            } else {
              if (hasOwnProp(rest, objProp)) {
                isHas = true
                rest = rest[objProp]
              }
            }
          } else {
            if (hasOwnProp(rest, prop)) {
              isHas = true
              rest = rest[prop]
            }
          }
          if (isHas) {
            if (index === len - 1) {
              return true
            }
          } else {
            break
          }
        }
      }
    }
    return false
  }

  /**
 * ?????????????????????????????????????????? undefined?????????????????????
 * @param {Object/Array} obj ??????
 * @param {String/Function} property ????????????
 * @param {Object} defaultValue ?????????
 * @return {Object}
 */
  function get (obj, property, defaultValue) {
    if (eqNull(obj)) {
      return defaultValue
    }
    var result = pathGet(obj, property)
    return isUndefined(result) ? defaultValue : result
  }

  function valGet (obj, key) {
    var matchs = key ? key.match(staticHGKeyRE) : ''
    return matchs ? (matchs[1] ? (obj[matchs[1]] ? obj[matchs[1]][matchs[2]] : undefined) : obj[matchs[2]]) : obj[key]
  }

  function pathGet (obj, property) {
    if (obj) {
      var rest, props, len
      var index = 0
      if (obj[property] || hasOwnProp(obj, property)) {
        return obj[property]
      } else {
        props = helperGetHGSKeys(property)
        len = props.length
        if (len) {
          for (rest = obj; index < len; index++) {
            rest = valGet(rest, props[index])
            if (eqNull(rest)) {
              if (index === len - 1) {
                return rest
              }
              return
            }
          }
        }
        return rest
      }
    }
  }

  var sKeyRE = /(.+)\[(\d+)\]$/

  function valSet (obj, key, isSet, value) {
    if (obj[key]) {
      if (isSet) {
        obj[key] = value
      }
    } else {
      var index
      var matchs = key ? key.match(sKeyRE) : null
      var rest = isSet ? value : {}
      if (matchs) {
        index = staticParseInt(matchs[2])
        if (obj[matchs[1]]) {
          obj[matchs[1]][index] = rest
        } else {
          obj[matchs[1]] = new Array(index + 1)
          obj[matchs[1]][index] = rest
        }
      } else {
        obj[key] = rest
      }
      return rest
    }
    return obj[key]
  }

  /**
 * ???????????????????????????????????????????????????????????????
 * @param {Object/Array} obj ??????
 * @param {String/Function} property ????????????
 * @param {Object} value ???
 */
  function set (obj, property, value) {
    if (obj) {
      if (obj[property] || hasOwnProp(obj, property)) {
        obj[property] = value
      } else {
        var rest = obj
        var props = helperGetHGSKeys(property)
        var len = props.length
        for (var index = 0; index < len; index++) {
          rest = valSet(rest, props[index], index === len - 1, value)
        }
      }
    }
    return obj
  }

  function createiterateEmpty (iterate) {
    return function () {
      return isEmpty(iterate)
    }
  }

  /**
  * ????????????,????????????????????????,?????????iterate???????????????????????????
  *
  * @param {Array} obj ??????
  * @param {Function} iterate ??????/????????????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function groupBy (obj, iterate, context) {
    var groupKey
    var result = {}
    if (obj) {
      if (iterate && isObject(iterate)) {
        iterate = createiterateEmpty(iterate)
      } else if (!isFunction(iterate)) {
        iterate = property(iterate)
      }
      each(obj, function (val, key) {
        groupKey = iterate ? iterate.call(context, val, key, obj) : val
        if (result[groupKey]) {
          result[groupKey].push(val)
        } else {
          result[groupKey] = [val]
        }
      })
    }
    return result
  }

  /**
  * ??????????????????,????????????????????????????????????
  *
  * @param {Array} obj ??????
  * @param {Function} iterate ??????/????????????
  * @param {Object} context ?????????
  * @return {Object}
  */
  function countBy (obj, iterate, context) {
    var result = groupBy(obj, iterate, context || this)
    objectEach(result, function (item, key) {
      result[key] = item.length
    })
    return result
  }

  function handleObjectAndArrayClone (func, obj, deep) {
    return func(obj, deep ? function (val) {
      return copyValue(val, deep)
    } : function (val) {
      return val
    })
  }

  function handleValueClone (val, deep) {
    if (deep && val) {
      var Ctor = val.constructor
      switch (objectToString.call(val)) {
        case '[object Date]':
        case '[object RegExp]':
          return new Ctor(val.valueOf())
        case '[object Set]':
          var set = new Ctor()
          val.forEach(function (v) {
            set.add(v)
          })
          return set
        case '[object Map]':
          var map = new Ctor()
          val.forEach(function (v, k) {
            map.set(k, v)
          })
          return map
      }
    }
    return val
  }

  function copyValue (val, deep) {
    if (isPlainObject(val)) {
      return handleObjectAndArrayClone(objectMap, val, deep)
    } else if (isArray(val)) {
      return handleObjectAndArrayClone(map, val, deep)
    }
    return handleValueClone(val, deep)
  }

  /**
  * ?????????/?????????
  *
  * @param {Object} obj ??????/??????
  * @param {Boolean} deep ???????????????
  * @return {Object}
  */
  function clone (obj, deep) {
    if (obj) {
      return copyValue(obj, deep)
    }
    return obj
  }

  /**
  * ????????????
  *
  * @param {Object} obj ??????
  * @param {*} defs ?????????,????????????????????????????????????????????????????????????????????????)???????????????(???????????????)
  * @param {Object/Array} assigns ?????????
  * @return {Object}
  */
  function clear (obj, defs, assigns) {
    if (obj) {
      var len
      var isDefs = arguments.length > 1 && (isNull(defs) || !isObject(defs))
      var extds = isDefs ? assigns : defs
      if (isPlainObject(obj)) {
        objectEach(obj, isDefs ? function (val, key) {
          obj[key] = defs
        } : function (val, key) {
          helperDeleteProperty(obj, key)
        })
        if (extds) {
          assign(obj, extds)
        }
      } else if (isArray(obj)) {
        if (isDefs) {
          len = obj.length
          while (len > 0) {
            len--
            obj[len] = defs
          }
        } else {
          obj.length = 0
        }
        if (extds) {
          obj.push.apply(obj, extds)
        }
      }
    }
    return obj
  }

  function pluckProperty (name) {
    return function (obj, key) {
      return key === name
    }
  }

  /**
  * ??????????????????
  *
  * @param {Object/Array} obj ??????/??????
  * @param {Function/String} iterate ???????????????
  * @param {Object} context ?????????
  * @return {Object/Array}
  */
  function remove (obj, iterate, context) {
    if (obj) {
      if (!eqNull(iterate)) {
        var removeKeys = []
        var rest = []
        if (!isFunction(iterate)) {
          iterate = pluckProperty(iterate)
        }
        each(obj, function (item, index, rest) {
          if (iterate.call(context, item, index, rest)) {
            removeKeys.push(index)
          }
        })
        if (isArray(obj)) {
          lastEach(removeKeys, function (item, key) {
            rest.push(obj[item])
            obj.splice(item, 1)
          })
        } else {
          rest = {}
          arrayEach(removeKeys, function (key) {
            rest[key] = obj[key]
            helperDeleteProperty(obj, key)
          })
        }
        return rest
      }
      return clear(obj)
    }
    return obj
  }

  /**
  * ????????????????????????
  *
  * @param {Number} start ?????????
  * @param {Number} stop ?????????
  * @param {Number} step ?????????
  * @return {Object}
  */
  function range (start, stop, step) {
    var index, len
    var result = []
    var args = arguments
    if (args.length < 2) {
      stop = args[0]
      start = 0
    }
    index = start >> 0
    len = stop >> 0
    if (index < stop) {
      step = step >> 0 || 1
      for (; index < len; index += step) {
        result.push(index)
      }
    }
    return result
  }

  /**
  * ???????????????????????????????????????????????????
  *
  * @param {Object} destination ????????????
  * @param {...Object}
  * @return {Boolean}
  */
  function destructuring (destination, sources) {
    if (destination && sources) {
      var rest = assign.apply(this, [{}].concat(slice(arguments, 1)))
      var restKeys = keys(rest)
      arrayEach(keys(destination), function (key) {
        if (includes(restKeys, key)) {
          destination[key] = rest[key]
        }
      })
    }
    return destination
  }

  function helperCreateGetObjects (name, getIndex) {
    var proMethod = Object[name]
    return function (obj) {
      var result = []
      if (obj) {
        if (proMethod) {
          return proMethod(obj)
        }
        each(obj, getIndex > 1 ? function (key) {
          result.push(['' + key, obj[key]])
        } : function () {
          result.push(arguments[getIndex])
        })
      }
      return result
    }
  }

  function helperCreateIndexOf (name, callback) {
    return function (obj, val) {
      if (obj) {
        if (typeof obj === 'string' || isArray(obj)) {
          if (obj[name]) {
            return obj[name](val)
          }
          return callback(obj, val)
        }
        for (var key in obj) {
          if (hasOwnProp(obj, key)) {
            if (val === obj[key]) {
              return key
            }
          }
        }
      }
      return -1
    }
  }

  function helperCreateInInObjectString (type) {
    return function (obj) {
      return '[object ' + type + ']' === objectToString.call(obj)
    }
  }

  /* eslint-disable valid-typeof */
  function helperCreateInTypeof (type) {
    return function (obj) {
      return typeof obj === type
    }
  }

  function helperCreateiterateIndexOf (callback) {
    return function (obj, iterate, context) {
      if (obj && isFunction(iterate)) {
        if (isArray(obj) || isString(obj)) {
          return callback(obj, iterate, context)
        }
        for (var key in obj) {
          if (hasOwnProp(obj, key)) {
            if (iterate.call(context, obj[key], key, obj)) {
              return key
            }
          }
        }
      }
      return -1
    }
  }

  function helperCreatePickOmit (case1, case2) {
    return function (obj, callback) {
      var item, index
      var rest = {}
      var result = []
      var context = this
      var args = arguments
      var len = args.length
      if (!isFunction(callback)) {
        for (index = 1; index < len; index++) {
          item = args[index]
          result.push.apply(result, isArray(item) ? item : [item])
        }
        callback = 0
      }
      each(obj, function (val, key) {
        if ((callback ? callback.call(context, val, key, obj) : findIndexOf(result, function (name) {
          return name === key
        }) > -1) ? case1 : case2) {
          rest[key] = val
        }
      })
      return rest
    }
  }

  function helperDefaultCompare (v1, v2) {
    return v1 === v2
  }

  function helperDeleteProperty (obj, property) {
    try {
      delete obj[property]
    } catch (e) {
      obj[property] = undefined
    }
  }

  function helperEqualCompare (val1, val2, compare, func, key, obj1, obj2) {
    if (val1 === val2) {
      return true
    }
    if (val1 && val2 && !isNumber(val1) && !isNumber(val2) && !isString(val1) && !isString(val2)) {
      if (isRegExp(val1)) {
        return compare('' + val1, '' + val2, key, obj1, obj2)
      } if (isDate(val1) || isBoolean(val1)) {
        return compare(+val1, +val2, key, obj1, obj2)
      } else {
        var result, val1Keys, val2Keys
        var isObj1Arr = isArray(val1)
        var isObj2Arr = isArray(val2)
        if (isObj1Arr || isObj2Arr ? isObj1Arr && isObj2Arr : val1.constructor === val2.constructor) {
          val1Keys = keys(val1)
          val2Keys = keys(val2)
          if (func) {
            result = func(val1, val2, key)
          }
          if (val1Keys.length === val2Keys.length) {
            return isUndefined(result) ? every(val1Keys, function (key, index) {
              return key === val2Keys[index] && helperEqualCompare(val1[key], val2[val2Keys[index]], compare, func, isObj1Arr || isObj2Arr ? index : key, val1, val2)
            }) : !!result
          }
          return false
        }
      }
    }
    return compare(val1, val2, key, obj1, obj2)
  }

  function helperGetHGSKeys (property) {
  // ???????????????????????????????????????????????????
    return property ? (property.splice && property.join ? property : ('' + property).split('.')) : []
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Number} minVal ?????????
  * @param {Number} maxVal ?????????
  * @return {Number}
  */
  function random (minVal, maxVal) {
    return minVal >= maxVal ? minVal : ((minVal = minVal >> 0) + Math.round(Math.random() * ((maxVal || 9) - minVal)))
  }

  /**
  * ???????????????
  *
  * @param {Array} arr ??????
  * @param {Function} iterate(item, index, obj) ??????
  * @return {Number}
  */
  var min = helperCreateMinMax(function (rest, itemVal) {
    return rest > itemVal
  })

  /**
  * ???????????????
  *
  * @param {Array} arr ??????
  * @param {Function} iterate(item, index, obj) ??????
  * @return {Number}
  */
  var max = helperCreateMinMax(function (rest, itemVal) {
    return rest < itemVal
  })

  /**
  * ??????????????????????????????
  *
  * @param {String/Number} num ??????
  * @param {CommafyOptions} options ??????
  * @return {String}
 */
  function commafy (num, options) {
    var opts = options || {}
    var optDigits = opts.digits || opts.fixed
    var isNum = isNumber(num)
    var rest, result, isNegative, intStr, floatStr
    if (isNum) {
      rest = (opts.ceil ? ceil : (opts.floor ? floor : round))(num, optDigits)
      result = toNumberString(optDigits ? toFixed(rest, optDigits) : rest).split('.')
      intStr = result[0]
      floatStr = result[1]
      isNegative = intStr && rest < 0
      if (isNegative) {
        intStr = intStr.substring(1, intStr.length)
      }
    } else {
    // ????????????????????????????????????
      rest = toValString(num).replace(/,/g, '')
      result = rest ? [rest] : []
      intStr = result[0]
    }
    if (result.length) {
      return (isNegative ? '-' : '') + intStr.replace(new RegExp('(?=(?!(\\b))(.{' + (opts.spaceNumber || 3) + '})+$)', 'g'), (opts.separator || ',')) + (floatStr ? ('.' + floatStr) : '')
    }
    return rest
  }

  /**
 * ?????????????????????
 *
 * @param {string|number} num ??????
 * @param {number} digits ??????????????????
 * @return {number}
 */
  var round = helperCreateMathNumber('round')

  /**
 * ?????????????????????
 *
 * @param {string|number} num ??????
 * @param {number} digits ??????????????????
 * @return {number}
 */
  var ceil = helperCreateMathNumber('ceil')

  /**
 * ?????????????????????
 *
 * @param {string|number} num ??????
 * @param {number} digits ??????????????????
 * @return {number}
 */
  var floor = helperCreateMathNumber('floor')

  /**
  * ???????????????????????????????????????????????????????????????
  *
 * @param {string|number} num ??????
 * @param {number} digits ??????????????????
  * @return {String}
  */
  function toFixed (num, digits) {
    var str = toValString(round(num, digits))
    var nums = str.split('.')
    var intStr = nums[0]
    var floatStr = nums[1] || ''
    var digitOffsetIndex = digits - floatStr.length
    if (digits) {
      if (digitOffsetIndex > 0) {
        return intStr + '.' + floatStr + helperStringRepeat('0', digitOffsetIndex)
      }
      return intStr + helperNumberOffsetPoint(floatStr, Math.abs(digitOffsetIndex))
    }
    return intStr
  }

  /**
 * ??? Number.toFixed ??????????????????????????????????????????????????????????????????????????????
 *
 * @param { String/Number } str ??????
 * @return {String}
 */
  function toFixedString (str, digits) {
    return toFixed(floor(str, digits), digits)
  }

  /**
 * ??? Number.toFixed ???????????????????????????????????????????????????????????????????????????
 *
 * @param { String/Number } str ??????
 * @return {String}
 */
  function toFixedNumber (str, digits) {
    return floor(str, digits)
  }

  /**
 * ?????????
 * @param { String/Number } str ??????
 *
 * @return {Number}
 */
  var toNumber = helperCreateToNumber(parseFloat)

  /**
 * ?????????????????????????????????????????????
 * @param { Number } num ??????
 *
 * @return {Number}
 */
  function toNumberString (num) {
    var rest = '' + num
    var scienceMatchs = rest.match(/^([-+]?)((\d+)|((\d+)?[.](\d+)?))e([-+]{1})([0-9]+)$/)
    if (scienceMatchs) {
      var isNegative = num < 0
      var absFlag = isNegative ? '-' : ''
      var intNumStr = scienceMatchs[3] || ''
      var dIntNumStr = scienceMatchs[5] || ''
      var dFloatNumStr = scienceMatchs[6] || ''
      var sciencFlag = scienceMatchs[7]
      var scienceNumStr = scienceMatchs[8]
      var floatOffsetIndex = scienceNumStr - dFloatNumStr.length
      var intOffsetIndex = scienceNumStr - intNumStr.length
      var dIntOffsetIndex = scienceNumStr - dIntNumStr.length
      if (sciencFlag === '+') {
        if (intNumStr) {
          return absFlag + intNumStr + helperStringRepeat('0', scienceNumStr)
        }
        if (floatOffsetIndex > 0) {
          return absFlag + dIntNumStr + dFloatNumStr + helperStringRepeat('0', floatOffsetIndex)
        }
        return absFlag + dIntNumStr + helperNumberOffsetPoint(dFloatNumStr, scienceNumStr)
      }
      if (intNumStr) {
        if (intOffsetIndex > 0) {
          return absFlag + '0.' + helperStringRepeat('0', Math.abs(intOffsetIndex)) + intNumStr
        }
        return absFlag + helperNumberOffsetPoint(intNumStr, intOffsetIndex)
      }
      if (dIntOffsetIndex > 0) {
        return absFlag + '0.' + helperStringRepeat('0', Math.abs(dIntOffsetIndex)) + dIntNumStr + dFloatNumStr
      }
      return absFlag + helperNumberOffsetPoint(dIntNumStr, dIntOffsetIndex) + dFloatNumStr
    }
    return rest
  }

  /**
 * ?????????
 * @param { String/Number } str ??????
 *
 * @return {Number}
 */
  var toInteger = helperCreateToNumber(staticParseInt)

  /**
 * ????????????
 *
 * @param { Number } num1 ?????????
 * @param { Number } num2 ??????
 * @return {Number}
 */
  function add (num1, num2) {
    return helperNumberAdd(toNumber(num1), toNumber(num2))
  }

  /**
 * ????????????
 *
 * @param { Number } num1 ?????????
 * @param { Number } num2 ??????
 * @return {Number}
 */
  function subtract (num1, num2) {
    var subtrahend = toNumber(num1)
    var minuend = toNumber(num2)
    var str1 = toNumberString(subtrahend)
    var str2 = toNumberString(minuend)
    var digit1 = helperNumberDecimal(str1)
    var digit2 = helperNumberDecimal(str2)
    var ratio = Math.pow(10, Math.max(digit1, digit2))
    var precision = (digit1 >= digit2) ? digit1 : digit2
    return parseFloat(toFixed((subtrahend * ratio - minuend * ratio) / ratio, precision))
  }

  /**
 * ????????????
 *
 * @param { Number } num1 ??????1
 * @param { Number } num2 ??????2
 * @return {Number}
 */
  function multiply (num1, num2) {
    var multiplier = toNumber(num1)
    var multiplicand = toNumber(num2)
    var str1 = toNumberString(multiplier)
    var str2 = toNumberString(multiplicand)
    return parseInt(str1.replace('.', '')) * parseInt(str2.replace('.', '')) / Math.pow(10, helperNumberDecimal(str1) + helperNumberDecimal(str2))
  }

  /**
 * ????????????
 *
 * @param { Number } num1 ??????1
 * @param { Number } num2 ??????2
 * @return {Number}
 */
  function divide (num1, num2) {
    return helperNumberDivide(toNumber(num1), toNumber(num2))
  }

  /**
  * ??????????????????????????????
  *
  * @param {Array} array ??????
  * @param {Function/String} iterate ???????????????
  * @param {Object} context ?????????
  * @return {Number}
  */
  function sum (array, iterate, context) {
    var result = 0
    each(array, iterate ? isFunction(iterate) ? function () {
      result = helperNumberAdd(result, iterate.apply(context, arguments))
    } : function (val) {
      result = helperNumberAdd(result, get(val, iterate))
    } : function (val) {
      result = helperNumberAdd(result, val)
    })
    return result
  }

  /**
  * ??????????????????
  *
  * @param {Array} array ??????
  * @param {Function/String} iterate ???????????????
  * @param {Object} context ?????????
  * @return {Number}
  */
  function mean (array, iterate, context) {
    return helperNumberDivide(sum(array, iterate, context), getSize(array))
  }

  function helperCreateMathNumber (name) {
    return function (num, digits) {
      var rest = toNumber(num)
      if (rest) {
        digits = digits >> 0
        var numStr = toNumberString(rest)
        var nums = numStr.split('.')
        var intStr = nums[0]
        var floatStr = nums[1] || ''
        rest = intStr + '.' + floatStr.substring(0, digits + 1)
        if (digits >= floatStr.length) {
          return toNumber(rest)
        }
        if (digits > 0) {
          var ratio = Math.pow(10, digits)
          return Math[name](rest * ratio) / ratio
        }
        return Math[name](rest)
      }
      return rest
    }
  }

  function helperCreateMinMax (handle) {
    return function (arr, iterate) {
      if (arr && arr.length) {
        var rest, itemIndex
        arrayEach(arr, function (itemVal, index) {
          if (iterate) {
            itemVal = isFunction(iterate) ? iterate(itemVal, index, arr) : get(itemVal, iterate)
          }
          if (!eqNull(itemVal) && (eqNull(rest) || handle(rest, itemVal))) {
            itemIndex = index
            rest = itemVal
          }
        })
        return arr[itemIndex]
      }
      return rest
    }
  }

  function helperCreateToNumber (handle) {
    return function (str) {
      if (str) {
        var num = handle(str)
        if (!isNaN(num)) {
          return num
        }
      }
      return 0
    }
  }

  function helperNumberAdd (addend, augend) {
    var str1 = toNumberString(addend)
    var str2 = toNumberString(augend)
    var ratio = Math.pow(10, Math.max(helperNumberDecimal(str1), helperNumberDecimal(str2)))
    return (multiply(addend, ratio) + multiply(augend, ratio)) / ratio
  }

  function helperNumberDecimal (numStr) {
    return (numStr.split('.')[1] || '').length
  }

  function helperNumberDivide (divisor, dividend) {
    var str1 = toNumberString(divisor)
    var str2 = toNumberString(dividend)
    var divisorDecimal = helperNumberDecimal(str1)
    var dividendDecimal = helperNumberDecimal(str2)
    var powY = dividendDecimal - divisorDecimal
    var isMinus = powY < 0
    var multiplicand = Math.pow(10, isMinus ? Math.abs(powY) : powY)
    return multiply(str1.replace('.', '') / str2.replace('.', ''), isMinus ? 1 / multiplicand : multiplicand)
  }

  function helperNumberOffsetPoint (str, offsetIndex) {
    return str.substring(0, offsetIndex) + '.' + str.substring(offsetIndex, str.length)
  }

  /**
 * ?????????????????????
 *
 * @returns Number
 */
  var now = Date.now || function () {
    return helperGetDateTime(helperNewDate())
  }

  /**
 * ??????????????????????????????
 *
  * @param {String/Number/Date} str ???????????????
  * @param {String} format ??????????????????
 * @returns Number
 */
  var timestamp = function (str, format) {
    if (str) {
      var date = toStringDate(str, format)
      return isDate(date) ? helperGetDateTime(date) : date
    }
    return now()
  }

  /**
  * ?????????????????????Date??????
  *
  * @param {any} val ??????
  * @return {boolean}
  */
  function isValidDate (val) {
    return isDate(val) && !isNaN(helperGetDateTime(val))
  }

  /**
 * ??????????????????
 *
 * @param {Number/String/Date} date1 ??????
 * @param {Number/String/Date} date2 ??????
 * @param {String} format ????????????
 */
  function isDateSame (date1, date2, format) {
    if (date1 && date2) {
      date1 = toDateString(date1, format)
      return date1 !== 'Invalid Date' && date1 === toDateString(date2, format)
    }
    return false
  }

  var dateFormatRules = [
    { rules: [['yyyy', 4]] },
    { rules: [['MM', 2], ['M', 1]], offset: -1 },
    { rules: [['dd', 2], ['d', 1]] },
    { rules: [['HH', 2], ['H', 1]] },
    { rules: [['mm', 2], ['m', 1]] },
    { rules: [['ss', 2], ['s', 1]] },
    { rules: [['SSS', 3], ['S', 1]] },
    { rules: [['ZZ', 5], ['Z', 6], ['Z', 5], ['Z', 1]] }
  ]

  function parseStringDate (str, format) {
    var arr, sIndex, fIndex, fLen, fItem, rules, rIndex, rLen, tempMatch
    var dates = [0, 0, 1, 0, 0, 0, 0]
    for (fIndex = 0, fLen = dateFormatRules.length; fIndex < fLen; fIndex++) {
      fItem = dateFormatRules[fIndex]
      for (rIndex = 0, rules = fItem.rules, rLen = rules.length; rIndex < rLen; rIndex++) {
        arr = rules[rIndex]
        sIndex = format.indexOf(arr[0])
        if (sIndex > -1) {
          tempMatch = str.substring(sIndex, sIndex + arr[1])
          if (tempMatch && tempMatch.length === arr[1]) {
            if (fItem.offset) {
              tempMatch = staticParseInt(tempMatch) + fItem.offset
            }
            dates[fIndex] = tempMatch
            break
          }
        }
        if (rIndex === rLen - 1) {
          return dates
        }
      }
    }
    return dates
  }

  /**
  * ?????????????????????
  *
  * @param {String/Number/Date} str ???????????????
  * @param {String} format ??????????????????(yyyy?????????MM?????????dd??????hh(12)HH(24)?????????mm?????????ss??????SSS?????????Z??????)
  * @return {String}
  */
  function toStringDate (str, format) {
    var rest, isDType
    if (str) {
      isDType = isDate(str)
      if (isDType || (!format && /^[0-9]{11,15}$/.test(str))) {
        rest = new Date(isDType ? helperGetDateTime(str) : staticParseInt(str))
      } else if (isString(str)) {
        var tempMatch
        var dates = parseStringDate(str, format || setupDefaults.formatDate)
        var zStr = dates[7]
        if (dates[0]) {
        // ????????????
          if (zStr) {
          // ?????????UTC ??????
            if (zStr[0] === 'z' || zStr[0] === 'Z') {
              rest = new Date(helperGetUTCDateTime(dates))
            } else {
            // ?????????????????????????????????
              tempMatch = zStr.match(/([-+]{1})(\d{2}):?(\d{2})/)
              if (tempMatch) {
                rest = new Date(helperGetUTCDateTime(dates) - (tempMatch[1] === '-' ? -1 : 1) * staticParseInt(tempMatch[2]) * 3600000 + staticParseInt(tempMatch[3]) * 60000)
              }
            }
          } else {
            rest = new Date(dates[0], dates[1], dates[2], dates[3], dates[4], dates[5], dates[6])
          }
        }
      }
    }
    return rest || new Date('')
  }

  function handleCustomTemplate (date, formats, match, value) {
    var format = formats[match]
    if (format) {
      if (isFunction(format)) {
        return format(value, match, date)
      } else {
        return format[value]
      }
    }
    return value
  }

  function formatDayE (day) {
    return day === 0 ? 7 : day
  }

  /**
  * ?????????????????????????????????????????? []
  *
  * @param {Date} date ???????????????
  * @param {String} format ??????????????????(??????(yy|yyyy)?????????(M|MM?????????0)??????(d|dd?????????0)???12?????????(h|hh?????????0)???24?????????(H|HH?????????0)?????????(m|mm?????????0)??????(s|ss?????????0)?????????(S|SSS?????????0)???D?????????????????????a/A???????????????e/E????????????w?????????????????????W?????????????????????q????????????????????????Z??????)
  * @param {Object} options {formats: {q: ['???', '???', '???', '???', '???', '???', '???'], E: function (value, match, date) {return '???'}, }} ????????????????????????
  * @return {String}
  */
  var dateFormatRE = /\[([^\]]+)]|y{2,4}|M{1,2}|d{1,2}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|S{1,3}|Z{1,2}|W{1,2}|D{1,3}|[aAeEq]/g
  function toDateString (date, format, options) {
    if (date) {
      date = toStringDate(date)
      if (isValidDate(date)) {
        var result = format || setupDefaults.formatString
        var hours = date.getHours()
        var apm = hours < 12 ? 'am' : 'pm'
        var formats = assign({}, setupDefaults.formatStringMatchs, options ? options.formats : null)
        var fy = function (match, length) {
          return ('' + helperGetDateFullYear(date)).substr(4 - length)
        }
        var fM = function (match, length) {
          return padStart(helperGetDateMonth(date) + 1, length, '0')
        }
        var fd = function (match, length) {
          return padStart(date.getDate(), length, '0')
        }
        var fH = function (match, length) {
          return padStart(hours, length, '0')
        }
        var fh = function (match, length) {
          return padStart(hours <= 12 ? hours : hours - 12, length, '0')
        }
        var fm = function (match, length) {
          return padStart(date.getMinutes(), length, '0')
        }
        var fs = function (match, length) {
          return padStart(date.getSeconds(), length, '0')
        }
        var fS = function (match, length) {
          return padStart(date.getMilliseconds(), length, '0')
        }
        var fZ = function (match, length) {
          var zoneHours = date.getTimezoneOffset() / 60 * -1
          return handleCustomTemplate(date, formats, match, (zoneHours >= 0 ? '+' : '-') + padStart(zoneHours, 2, '0') + (length === 1 ? ':' : '') + '00')
        }
        var fW = function (match, length) {
          return padStart(handleCustomTemplate(date, formats, match, getYearWeek(date)), length, '0')
        }
        var fD = function (match, length) {
          return padStart(handleCustomTemplate(date, formats, match, getYearDay(date)), length, '0')
        }
        var parseDates = {
          yyyy: fy,
          yy: fy,
          MM: fM,
          M: fM,
          dd: fd,
          d: fd,
          HH: fH,
          H: fH,
          hh: fh,
          h: fh,
          mm: fm,
          m: fm,
          ss: fs,
          s: fs,
          SSS: fS,
          S: fS,
          ZZ: fZ,
          Z: fZ,
          WW: fW,
          W: fW,
          DDD: fD,
          D: fD,
          a: function (match) {
            return handleCustomTemplate(date, formats, match, apm)
          },
          A: function (match) {
            return handleCustomTemplate(date, formats, match, apm.toLocaleUpperCase())
          },
          e: function (match) {
            return handleCustomTemplate(date, formats, match, date.getDay())
          },
          E: function (match) {
            return handleCustomTemplate(date, formats, match, formatDayE(date.getDay()))
          },
          q: function (match) {
            return handleCustomTemplate(date, formats, match, Math.floor((helperGetDateMonth(date) + 3) / 3))
          }
        }
        return result.replace(dateFormatRE, function (match, skip) {
          return skip || (parseDates[match] ? parseDates[match](match, match.length) : match)
        })
      }
      return 'Invalid Date'
    }
    return ''
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Date} date ???????????????
  * @param {Number} year ???(???????????????)???????????????(??????)???????????????(??????)
  * @param {Number/String} month ????????????(null???????????????)?????????(first)?????????(last)??????????????????0-11???
  * @return {Date}
  */
  function getWhatYear (date, year, month) {
    var number
    date = toStringDate(date)
    if (isValidDate(date)) {
      if (year) {
        number = year && !isNaN(year) ? year : 0
        date.setFullYear(helperGetDateFullYear(date) + number)
      }
      if (month || !isNaN(month)) {
        if (month === staticStrFirst) {
          return new Date(helperGetDateFullYear(date), 0, 1)
        } else if (month === staticStrLast) {
          date.setMonth(11)
          return getWhatMonth(date, 0, staticStrLast)
        } else {
          date.setMonth(month)
        }
      }
    }
    return date
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Date} date ???????????????
  * @param {Number} month ???(???????????????)??????????????????????????????
  * @param {Number/String} day ????????????(null???????????????)?????????(first)?????????(last)???????????????(??????)
  * @return {Date}
  */
  function getWhatMonth (date, month, day) {
    var monthOffset = month && !isNaN(month) ? month : 0
    date = toStringDate(date)
    if (isValidDate(date)) {
      if (day === staticStrFirst) {
        return new Date(helperGetDateFullYear(date), helperGetDateMonth(date) + monthOffset, 1)
      } else if (day === staticStrLast) {
        return new Date(helperGetDateTime(getWhatMonth(date, monthOffset + 1, staticStrFirst)) - 1)
      } else if (isNumber(day)) {
        date.setDate(day)
      }
      if (monthOffset) {
        date.setMonth(helperGetDateMonth(date) + monthOffset)
      }
    }
    return date
  }

  /**
  * ???????????????????????????????????????
  *
  * @param {Date} date ??????
  * @param {Number} week ???(???????????????)????????????????????????
  * @param {Number} day ?????????(??????0)????????????(1)????????????(2)????????????(3)????????????(4)????????????(5)????????????(6)
  * @return {Date}
  */
  function getWhatWeek (date, week, day) {
    var time, whatDayTime, currentDay, customDay
    date = toStringDate(date)
    if (isValidDate(date)) {
      customDay = staticParseInt(/^[0-7]$/.test(day) ? day : date.getDay())
      currentDay = date.getDay()
      time = helperGetDateTime(date)
      whatDayTime = time + ((customDay === 0 ? 7 : customDay) - (currentDay === 0 ? 7 : currentDay)) * staticDayTime
      if (week && !isNaN(week)) {
        whatDayTime += week * staticWeekTime
      }
      return new Date(whatDayTime)
    }
    return date
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Date} date ???????????????
  * @param {Number} day ???(????????????)????????????????????????
  * @param {String} mode ???????????????(null?????????????????????)?????????(first)?????????(last)
  * @return {Date}
  */
  function getWhatDay (date, day, mode) {
    date = toStringDate(date)
    if (isValidDate(date) && !isNaN(day)) {
      date.setDate(date.getDate() + staticParseInt(day))
      if (mode === staticStrFirst) {
        return new Date(helperGetDateFullYear(date), helperGetDateMonth(date), date.getDate())
      } else if (mode === staticStrLast) {
        return new Date(helperGetDateTime(getWhatDay(date, 1, staticStrFirst)) - 1)
      }
    }
    return date
  }

  /**
  * ??????????????????????????????
  *
  * @param {Date} date ???????????????
  * @return {Number}
  */
  function getYearDay (date) {
    date = toStringDate(date)
    if (isValidDate(date)) {
      return Math.floor((helperGetYMDTime(date) - helperGetYMDTime(getWhatYear(date, 0, staticStrFirst))) / staticDayTime) + 1
    }
    return NaN
  }

  /**
  * ??????????????????????????????
  *
  * @param {Date} date ???????????????
  * @return {Number}
  */
  function getYearWeek (date) {
    date = toStringDate(date)
    if (isValidDate(date)) {
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
      var week = new Date(date.getFullYear(), 0, 4)
      return Math.round(((date.getTime() - week.getTime()) / staticDayTime + (week.getDay() + 6) % 7 - 3) / 7) + 1
    }
    return NaN
  }

  /**
  * ???????????????????????????
  *
  * @param {Date} date ???????????????
  * @return {Number}
  */
  function getMonthWeek (date) {
    var monthFirst, monthFirstWeek
    var currentDate = toStringDate(date)
    if (isValidDate(currentDate)) {
      monthFirst = getWhatMonth(currentDate, 0, staticStrFirst)
      monthFirstWeek = getWhatWeek(monthFirst, 0, 1)
      if (monthFirstWeek < monthFirst) {
        monthFirstWeek = getWhatWeek(monthFirst, 1, 1)
      }
      if (currentDate >= monthFirstWeek) {
        return Math.floor((helperGetYMDTime(currentDate) - helperGetYMDTime(monthFirstWeek)) / staticWeekTime) + 1
      }
      return getMonthWeek(getWhatWeek(currentDate, 0, 1))
    }
    return NaN
  }

  /**
  * ???????????????????????????
  *
  * @param {Date} date ???????????????
  * @param {Number} year ???(????????????)??????????????????????????????
  * @return {Number}
  */
  function getDayOfYear (date, year) {
    date = toStringDate(date)
    if (isValidDate(date)) {
      return isLeapYear(getWhatYear(date, year)) ? 366 : 365
    }
    return NaN
  }

  /**
  * ???????????????????????????
  *
  * @param {Date} date ???????????????
  * @param {Number} month ???(????????????)??????????????????????????????
  * @return {Number}
  */
  function getDayOfMonth (date, month) {
    date = toStringDate(date)
    if (isValidDate(date)) {
      return Math.floor((helperGetDateTime(getWhatMonth(date, month, staticStrLast)) - helperGetDateTime(getWhatMonth(date, month, staticStrFirst))) / staticDayTime) + 1
    }
    return NaN
  }

  /**
  * ??????????????????????????????,????????????????????????????????????done???fasle
  *
  * @param {Date} startDate ????????????
  * @param {Date} endDate ???????????????????????????
  * @param {Date} rule ?????????????????????
  * @return {Object}
  */
  function getDateDiff (startDate, endDate, rules) {
    var startTime, endTime, item, diffTime, rule, len, index
    var result = { done: false, time: 0 }
    startDate = toStringDate(startDate)
    endDate = endDate ? toStringDate(endDate) : helperNewDate()
    if (isValidDate(startDate) && isValidDate(endDate)) {
      startTime = helperGetDateTime(startDate)
      endTime = helperGetDateTime(endDate)
      if (startTime < endTime) {
        diffTime = result.time = endTime - startTime
        rule = rules && rules.length > 0 ? rules : setupDefaults.dateDiffRules
        result.done = true
        for (index = 0, len = rule.length; index < len; index++) {
          item = rule[index]
          if (diffTime >= item[1]) {
            if (index === len - 1) {
              result[item[0]] = diffTime || 0
            } else {
              result[item[0]] = Math.floor(diffTime / item[1])
              diffTime -= result[item[0]] * item[1]
            }
          } else {
            result[item[0]] = 0
          }
        }
      }
    }
    return result
  }

  function helperGetDateFullYear (date) {
    return date.getFullYear()
  }

  function helperGetDateMonth (date) {
    return date.getMonth()
  }

  function helperGetDateTime (date) {
    return date.getTime()
  }

  function helperGetUTCDateTime (dates) {
    return Date.UTC(dates[0], dates[1], dates[2], dates[3], dates[4], dates[5], dates[6])
  }

  function helperGetYMD (date) {
    return new Date(helperGetDateFullYear(date), helperGetDateMonth(date), date.getDate())
  }

  function helperGetYMDTime (date) {
    return helperGetDateTime(helperGetYMD(date))
  }

  function helperNewDate () {
    return new Date()
  }

  /**
  * ????????????????????????????????????
  *
  * @param {String} str ?????????
  * @return {String}
  */
  function trim (str) {
    return str && str.trim ? str.trim() : trimRight(trimLeft(str))
  }

  /**
  * ??????????????????????????????
  *
  * @param {String} str ?????????
  * @return {String}
  */
  function trimLeft (str) {
    return str && str.trimLeft ? str.trimLeft() : toValString(str).replace(/^[\s\uFEFF\xA0]+/g, '')
  }

  /**
  * ??????????????????????????????
  *
  * @param {String} str ?????????
  * @return {String}
  */
  function trimRight (str) {
    return str && str.trimRight ? str.trimRight() : toValString(str).replace(/[\s\uFEFF\xA0]+$/g, '')
  }

  /**
  * ??????HTML??????????????????&, <, >, ", ', `??????
  *
  * @param {String} str ?????????
  * @return {String}
  */
  var escape = helperFormatEscaper(staticEscapeMap)

  var unescapeMap = {}
  each(staticEscapeMap, function (item, key) {
    unescapeMap[staticEscapeMap[key]] = key
  })

  /**
  * ??????escape
  *
  * @param {String} str ?????????
  * @return {String}
  */
  var unescape = helperFormatEscaper(unescapeMap)

  var camelCacheMaps = {}

  /**
  * ????????????????????????????????????,????????? project-name ?????? projectName
  *
  * @param {String} str ?????????
  * @return {String}
  */
  function camelCase (str) {
    str = toValString(str)
    if (camelCacheMaps[str]) {
      return camelCacheMaps[str]
    }
    var strLen = str.length
    var rest = str.replace(/([-]+)/g, function (text, flag, index) {
      return index && index + flag.length < strLen ? '-' : ''
    })
    strLen = rest.length
    rest = rest.replace(/([A-Z]+)/g, function (text, upper, index) {
      var upperLen = upper.length
      upper = helperStringLowerCase(upper)
      if (index) {
        if (upperLen > 2 && index + upperLen < strLen) {
          return helperStringUpperCase(helperStringSubstring(upper, 0, 1)) + helperStringSubstring(upper, 1, upperLen - 1) + helperStringUpperCase(helperStringSubstring(upper, upperLen - 1, upperLen))
        }
        return helperStringUpperCase(helperStringSubstring(upper, 0, 1)) + helperStringSubstring(upper, 1, upperLen)
      } else {
        if (upperLen > 1 && index + upperLen < strLen) {
          return helperStringSubstring(upper, 0, upperLen - 1) + helperStringUpperCase(helperStringSubstring(upper, upperLen - 1, upperLen))
        }
      }
      return upper
    }).replace(/(-[a-zA-Z])/g, function (text, upper) {
      return helperStringUpperCase(helperStringSubstring(upper, 1, upper.length))
    })
    camelCacheMaps[str] = rest
    return rest
  }

  var kebabCacheMaps = {}

  /**
  * ????????????????????????????????????,????????? projectName ?????? project-name
  *
  * @param {String} str ?????????
  * @return {String}
  */
  function kebabCase (str) {
    str = toValString(str)
    if (kebabCacheMaps[str]) {
      return kebabCacheMaps[str]
    }
    var rest = str.replace(/([a-z]?)([A-Z]+)([a-z]?)/g, function (text, prevLower, upper, nextLower, index) {
      var upperLen = upper.length
      if (upperLen > 1) {
        if (prevLower) {
          prevLower += '-'
        }
        if (nextLower) {
          return (prevLower || '') + helperStringLowerCase(helperStringSubstring(upper, 0, upperLen - 1)) + '-' + helperStringLowerCase(helperStringSubstring(upper, upperLen - 1, upperLen)) + nextLower
        }
      }
      return (prevLower || '') + (index ? '-' : '') + helperStringLowerCase(upper) + (nextLower || '')
    })
    rest = rest.replace(/([-]+)/g, function (text, flag, index) {
      return index && index + flag.length < rest.length ? '-' : ''
    })
    kebabCacheMaps[str] = rest
    return rest
  }

  /**
  * ?????????????????? n ???
  *
  * @param {String} str ?????????
  * @param {Number} count ??????
  * @return {String}
  */
  function repeat (str, count) {
    return helperStringRepeat(toValString(str), count)
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {String} str ?????????
  * @param {Number} targetLength ????????????
  * @param {Number} padString ????????????
  * @return {String}
  */
  function padStart (str, targetLength, padString) {
    var rest = toValString(str)
    targetLength = targetLength >> 0
    padString = isUndefined(padString) ? ' ' : '' + padString
    if (rest.padStart) {
      return rest.padStart(targetLength, padString)
    }
    if (targetLength > rest.length) {
      targetLength -= rest.length
      if (targetLength > padString.length) {
        padString += helperStringRepeat(padString, targetLength / padString.length)
      }
      return padString.slice(0, targetLength) + rest
    }
    return rest
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {String} str ?????????
  * @param {Number} targetLength ????????????
  * @param {Number} padString ????????????
  * @return {String}
  */
  function padEnd (str, targetLength, padString) {
    var rest = toValString(str)
    targetLength = targetLength >> 0
    padString = isUndefined(padString) ? ' ' : '' + padString
    if (rest.padEnd) {
      return rest.padEnd(targetLength, padString)
    }
    if (targetLength > rest.length) {
      targetLength -= rest.length
      if (targetLength > padString.length) {
        padString += helperStringRepeat(padString, targetLength / padString.length)
      }
      return rest + padString.slice(0, targetLength)
    }
    return rest
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {String} str ?????????
  * @param {String/Number} val ???
  * @param {Number} startIndex ????????????
  * @return {String}
  */
  function startsWith (str, val, startIndex) {
    var rest = toValString(str)
    return (arguments.length === 1 ? rest : rest.substring(startIndex)).indexOf(val) === 0
  }

  /**
  * ?????????????????????????????????????????????
  *
  * @param {String} str ?????????
  * @param {String/Number} val ???
  * @param {Number} startIndex ????????????
  * @return {String}
  */
  function endsWith (str, val, startIndex) {
    var rest = toValString(str)
    var argsLen = arguments.length
    return argsLen > 1 && (argsLen > 2 ? rest.substring(0, startIndex).indexOf(val) === startIndex - 1 : rest.indexOf(val) === rest.length - 1)
  }

  /**
 * ???????????????????????????
 * @param {atring} str ???????????????
 * @param {any | any[]} args ??????
 * @param {any} options
 */
  function template (str, args, options) {
    return toValString(str).replace((options || setupDefaults).tmplRE || /\{{2}([.\w[\]\s]+)\}{2}/g, function (match, key) {
      return get(args, trim(key))
    })
  }

  /**
 * ???????????????????????????
 * @param { string } str
 * @param { object | any[] } obj
 */
  function toFormatString (str, obj) {
    return template(str, obj, { tmplRE: /\{([.\w[\]\s]+)\}/g })
  }

  function toValString (obj) {
    if (isNumber(obj)) {
      return toNumberString(obj)
    }
    return '' + (eqNull(obj) ? '' : obj)
  }

  function helperFormatEscaper (dataMap) {
    var replaceRegexp = new RegExp('(?:' + keys(dataMap).join('|') + ')', 'g')
    return function (str) {
      return toValString(str).replace(replaceRegexp, function (match) {
        return dataMap[match]
      })
    }
  }

  function helperStringLowerCase (str) {
    return str.toLowerCase()
  }

  function helperStringRepeat (str, count) {
    if (str.repeat) {
      return str.repeat(count)
    }
    var list = isNaN(count) ? [] : new Array(staticParseInt(count))
    return list.join(str) + (list.length > 0 ? str : '')
  }

  function helperStringSubstring (str, start, end) {
    return str.substring(start, end)
  }

  function helperStringUpperCase (str) {
    return str.toUpperCase()
  }

  /**
 * ????????????????????????????????? undefined????????????????????????
 */
  function noop () {}

  /**
 * ???????????????????????????????????????
 *
 * @param {String} name ?????????
 * @param {Object} defs ??????
 */
  function property (name, defs) {
    return function (obj) {
      return isNull(obj) ? defs : obj[name]
    }
  }

  /**
  * ????????????????????????????????????
  *
  * @param {Function} callback ??????
  * @param {Object} context ?????????
  * @param {*} args ???????????????
  * @return {Object}
  */
  function bind (callback, context) {
    var args = slice(arguments, 2)
    return function () {
      return callback.apply(context, slice(arguments).concat(args))
    }
  }

  /**
  * ???????????????????????????????????????,???????????????????????????????????????
  *
  * @param {Function} callback ??????
  * @param {Object} context ?????????
  * @param {*} args ???????????????
  * @return {Object}
  */
  function once (callback, context) {
    var done = false
    var rest = null
    var args = slice(arguments, 2)
    return function () {
      if (done) {
        return rest
      }
      rest = callback.apply(context, slice(arguments).concat(args))
      done = true
      return rest
    }
  }

  /**
  * ??????????????????, ?????????????????? count ??????????????????????????????????????????????????????
  *
  * @param {Number} count ????????????
  * @param {Function} callback ????????????
  * @return {Object}
  */
  function after (count, callback, context) {
    var runCount = 0
    var rests = []
    return function () {
      var args = arguments
      runCount++
      if (runCount <= count) {
        rests.push(args[0])
      }
      if (runCount >= count) {
        callback.apply(context, [rests].concat(slice(args)))
      }
    }
  }

  /**
  * ??????????????????, ????????????????????? count ??????????????????????????????????????????????????????
  *
  * @param {Number} count ????????????
  * @param {Function} callback ????????????
  * @return {Object}
  */
  function before (count, callback, context) {
    var runCount = 0
    var rests = []
    context = context || this
    return function () {
      var args = arguments
      runCount++
      if (runCount < count) {
        rests.push(args[0])
        callback.apply(context, [rests].concat(slice(args)))
      }
    }
  }

  /**
  * ??????????????????????????? n ???????????????????????????????????????????????????????????????????????? n ??????????????????????????????
  *
  * @param {Function} callback ??????
  * @param {Number} wait ????????????
  * @param {Object} options ??????{leading: ?????????????????????, trailing: ?????????????????????}
  * @return {Function}
  */
  function throttle (callback, wait, options) {
    var args, context
    var opts = options || {}
    var runFlag = false
    var timeout = 0
    var optLeading = 'leading' in opts ? opts.leading : true
    var optTrailing = 'trailing' in opts ? opts.trailing : false
    var runFn = function () {
      runFlag = true
      callback.apply(context, args)
      timeout = setTimeout(endFn, wait)
    }
    var endFn = function () {
      timeout = 0
      if (!runFlag && optTrailing === true) {
        runFn()
      }
    }
    var cancelFn = function () {
      var rest = timeout !== 0
      clearTimeout(timeout)
      runFlag = false
      timeout = 0
      return rest
    }
    var throttled = function () {
      args = arguments
      context = this
      runFlag = false
      if (timeout === 0) {
        if (optLeading === true) {
          runFn()
        } else if (optTrailing === true) {
          timeout = setTimeout(endFn, wait)
        }
      }
    }
    throttled.cancel = cancelFn
    return throttled
  }

  /**
  * ??????????????????????????? n ???????????????????????????????????????????????????????????????????????????????????????
  *
  * @param {Function} callback ??????
  * @param {Number} wait ????????????
  * @param {Object} options ??????{leading: ?????????????????????, trailing: ?????????????????????}
  * @return {Function}
  */
  function debounce (callback, wait, options) {
    var args, context
    var opts = options || {}
    var runFlag = false
    var timeout = 0
    var isLeading = typeof options === 'boolean'
    var optLeading = 'leading' in opts ? opts.leading : isLeading
    var optTrailing = 'trailing' in opts ? opts.trailing : !isLeading
    var runFn = function () {
      runFlag = true
      timeout = 0
      callback.apply(context, args)
    }
    var endFn = function () {
      if (optLeading === true) {
        timeout = 0
      }
      if (!runFlag && optTrailing === true) {
        runFn()
      }
    }
    var cancelFn = function () {
      var rest = timeout !== 0
      clearTimeout(timeout)
      timeout = 0
      return rest
    }
    var debounced = function () {
      runFlag = false
      args = arguments
      context = this
      if (timeout === 0) {
        if (optLeading === true) {
          runFn()
        }
      } else {
        clearTimeout(timeout)
      }
      timeout = setTimeout(endFn, wait)
    }
    debounced.cancel = cancelFn
    return debounced
  }

  /**
  * ???????????? setTimeout ????????????????????????????????????????????????????????????
  *
  * @param {Function} callback ??????
  * @param {Number} wait ????????????
  * @param {*} args ???????????????
  * @return {Number}
 */
  function delay (callback, wait) {
    var args = slice(arguments, 2)
    var context = this
    return setTimeout(function () {
      callback.apply(context, args)
    }, wait)
  }

  function parseURLQuery (uri) {
    return unserialize(uri.split('?')[1] || '')
  }

  function parseUrl (url) {
    var hashs, portText, searchs, parsed
    var href = '' + url
    if (href.indexOf('//') === 0) {
      href = (staticLocation ? staticLocation.protocol : '') + href
    } else if (href.indexOf('/') === 0) {
      href = helperGetLocatOrigin() + href
    }
    searchs = href.replace(/#.*/, '').match(/(\?.*)/)
    parsed = {
      href: href,
      hash: '',
      host: '',
      hostname: '',
      protocol: '',
      port: '',
      search: searchs && searchs[1] && searchs[1].length > 1 ? searchs[1] : ''
    }
    parsed.path = href.replace(/^([a-z0-9.+-]*:)\/\//, function (text, protocol) {
      parsed.protocol = protocol
      return ''
    }).replace(/^([a-z0-9.+-]*)(:\d+)?\/?/, function (text, hostname, port) {
      portText = port || ''
      parsed.port = portText.replace(':', '')
      parsed.hostname = hostname
      parsed.host = hostname + portText
      return '/'
    }).replace(/(#.*)/, function (text, hash) {
      parsed.hash = hash.length > 1 ? hash : ''
      return ''
    })
    hashs = parsed.hash.match(/#((.*)\?|(.*))/)
    parsed.pathname = parsed.path.replace(/(\?|#.*).*/, '')
    parsed.origin = parsed.protocol + '//' + parsed.host
    parsed.hashKey = hashs ? (hashs[2] || hashs[1] || '') : ''
    parsed.hashQuery = parseURLQuery(parsed.hash)
    parsed.searchQuery = parseURLQuery(parsed.search)
    return parsed
  }

  function stringifyParams (resultVal, resultKey, isArr) {
    var _arr
    var result = []
    each(resultVal, function (item, key) {
      _arr = isArray(item)
      if (isPlainObject(item) || _arr) {
        result = result.concat(stringifyParams(item, resultKey + '[' + key + ']', _arr))
      } else {
        result.push(staticEncodeURIComponent(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + staticEncodeURIComponent(isNull(item) ? '' : item))
      }
    })
    return result
  }

  /**
 * ?????????????????????
 *
 * @param {Object} query ????????????
 */
  function serialize (query) {
    var _arr
    var params = []
    each(query, function (item, key) {
      if (!isUndefined(item)) {
        _arr = isArray(item)
        if (isPlainObject(item) || _arr) {
          params = params.concat(stringifyParams(item, key, _arr))
        } else {
          params.push(staticEncodeURIComponent(key) + '=' + staticEncodeURIComponent(isNull(item) ? '' : item))
        }
      }
    })
    return params.join('&').replace(/%20/g, '+')
  }

  /**
 * ????????????????????????
 *
 * @param {String} query ?????????
 */
  function unserialize (str) {
    var items
    var result = {}
    if (str && isString(str)) {
      arrayEach(str.split('&'), function (param) {
        items = param.split('=')
        result[staticDecodeURIComponent(items[0])] = staticDecodeURIComponent(items[1] || '')
      })
    }
    return result
  }

  function getBaseURL () {
    if (staticLocation) {
      var pathname = staticLocation.pathname
      var lastIndex = lastIndexOf(pathname, '/') + 1
      return helperGetLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
    }
    return ''
  }

  /**
  * ?????????????????????
  *
  * @return Object
  */
  function locat () {
    return staticLocation ? parseUrl(staticLocation.href) : {}
  }

  /* eslint-disable valid-typeof */
  function isBrowseStorage (storage) {
    try {
      var testKey = '__xe_t'
      storage.setItem(testKey, 1)
      storage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  function isBrowseType (type) {
    return navigator.userAgent.indexOf(type) > -1
  }

  /**
  * ?????????????????????
  * @return Object
  */
  function browse () {
    var $body, isChrome, isEdge
    var isMobile = false
    var result = {
      isNode: false,
      isMobile: isMobile,
      isPC: false,
      isDoc: !!staticDocument
    }
    if (!staticWindow && typeof process !== staticStrUndefined) {
      result.isNode = true
    } else {
      isEdge = isBrowseType('Edge')
      isChrome = isBrowseType('Chrome')
      isMobile = /(Android|webOS|iPhone|iPad|iPod|SymbianOS|BlackBerry|Windows Phone)/.test(navigator.userAgent)
      if (result.isDoc) {
        $body = staticDocument.body || staticDocument.documentElement
        arrayEach(['webkit', 'khtml', 'moz', 'ms', 'o'], function (core) {
          result['-' + core] = !!$body[core + 'MatchesSelector']
        })
      }
      assign(result, {
        edge: isEdge,
        firefox: isBrowseType('Firefox'),
        msie: !isEdge && result['-ms'],
        safari: !isChrome && !isEdge && isBrowseType('Safari'),
        isMobile: isMobile,
        isPC: !isMobile,
        isLocalStorage: isBrowseStorage(staticWindow.localStorage),
        isSessionStorage: isBrowseStorage(staticWindow.sessionStorage)
      })
    }
    return result
  }

  function toCookieUnitTime (unit, expires) {
    var num = parseFloat(expires)
    var nowdate = helperNewDate()
    var time = helperGetDateTime(nowdate)
    switch (unit) {
      case 'y': return helperGetDateTime(getWhatYear(nowdate, num))
      case 'M': return helperGetDateTime(getWhatMonth(nowdate, num))
      case 'd': return helperGetDateTime(getWhatDay(nowdate, num))
      case 'h':
      case 'H': return time + num * 60 * 60 * 1000
      case 'm': return time + num * 60 * 1000
      case 's': return time + num * 1000
    }
    return time
  }

  function toCookieUTCString (date) {
    return (isDate(date) ? date : new Date(date)).toUTCString()
  }

  /**
  * cookie????????????
  * @param {String/Array/Object} name ???/??????/??????
  * @param {String} value ???
  * @param {Object} options ??????
  *   @param {String} name: ???
  *   @param {Object} value: ???
  *   @param {String} path: ??????
  *   @param {String} domain: ?????????
  *   @param {Boolean} secure: ??????????????????,?????????https??????
  *   @param {Number} expires: ????????????,?????????????????????????????????????????????
  */
  function cookie (name, value, options) {
    if (staticDocument) {
      var opts, expires, values, result, cookies, keyIndex
      var inserts = []
      var args = arguments
      if (isArray(name)) {
        inserts = name
      } else if (args.length > 1) {
        inserts = [assign({ name: name, value: value }, options)]
      } else if (isObject(name)) {
        inserts = [name]
      }
      if (inserts.length > 0) {
        arrayEach(inserts, function (obj) {
          opts = assign({}, setupDefaults.cookies, obj)
          values = []
          if (opts.name) {
            expires = opts.expires
            values.push(staticEncodeURIComponent(opts.name) + '=' + staticEncodeURIComponent(isObject(opts.value) ? JSON.stringify(opts.value) : opts.value))
            if (expires) {
              if (isNaN(expires)) {
              // UTCString || Unit
                expires = expires.replace(/^([0-9]+)(y|M|d|H|h|m|s)$/, function (text, num, unit) {
                  return toCookieUTCString(toCookieUnitTime(unit, num))
                })
              } else if (/^[0-9]{11,13}$/.test(expires) || isDate(expires)) {
              // Date || now
                expires = toCookieUTCString(expires)
              } else {
              // day
                expires = toCookieUTCString(toCookieUnitTime('d', expires))
              }
              opts.expires = expires
            }
            arrayEach(['expires', 'path', 'domain', 'secure'], function (key) {
              if (!isUndefined(opts[key])) {
                values.push(opts[key] && key === 'secure' ? key : (key + '=' + opts[key]))
              }
            })
          }
          staticDocument.cookie = values.join('; ')
        })
        return true
      } else {
        result = {}
        cookies = staticDocument.cookie
        if (cookies) {
          arrayEach(cookies.split('; '), function (val) {
            keyIndex = val.indexOf('=')
            result[staticDecodeURIComponent(val.substring(0, keyIndex))] = staticDecodeURIComponent(val.substring(keyIndex + 1) || '')
          })
        }
        return args.length === 1 ? result[name] : result
      }
    }
    return false
  }

  function hasCookieItem (key) {
    return includes(cookieKeys(), key)
  }

  function getCookieItem (name, key) {
    return cookie(name, key)
  }

  function setCookieItem (name, key, options) {
    cookie(name, key, options)
    return cookie
  }

  function removeCookieItem (name, options) {
    cookie(name, 0, assign({ expires: -1 }, setupDefaults.cookies, options))
  }

  function cookieKeys () {
    return keys(cookie())
  }

  assign(cookie, {
    _c: false,
    isKey: hasCookieItem,
    has: hasCookieItem,
    set: setCookieItem,
    setItem: setCookieItem,
    get: getCookieItem,
    getItem: cookie,
    remove: removeCookieItem,
    removeItem: removeCookieItem,
    keys: cookieKeys,
    getJSON: cookie
  })

  function helperGetLocatOrigin () {
    return staticLocation ? (staticLocation.origin || (staticLocation.protocol + '//' + staticLocation.host)) : ''
  }

  // ??????

  // ?????????????????????

  // ?????????????????????

  // ????????????

  // ??????????????????

  // ?????????????????????

  // ????????????????????????

  // ?????????????????????

  // ?????????????????????

  // ????????????????????????

  assign(XEUtils, {
  // object
    assign: assign,
    extend: extend,
    objectEach: objectEach,
    lastObjectEach: lastObjectEach,
    objectMap: objectMap,
    merge: merge,

    // array
    uniq: uniq,
    union: union,
    sortBy: sortBy,
    orderBy: orderBy,
    shuffle: shuffle,
    sample: sample,
    some: some,
    every: every,
    slice: slice,
    filter: filter,
    find: find,
    findLast: findLast,
    findKey: findKey,
    includes: includes,
    arrayIndexOf: arrayIndexOf,
    arrayLastIndexOf: arrayLastIndexOf,
    map: map,
    reduce: reduce,
    copyWithin: copyWithin,
    chunk: chunk,
    zip: zip,
    unzip: unzip,
    zipObject: zipObject,
    flatten: flatten,
    toArray: toArray,
    includeArrays: includeArrays,
    pluck: pluck,
    invoke: invoke,
    invokeMap: invokeMap,
    arrayEach: arrayEach,
    lastArrayEach: lastArrayEach,
    toArrayTree: toArrayTree,
    toTreeArray: toTreeArray,
    findTree: findTree,
    eachTree: eachTree,
    mapTree: mapTree,
    filterTree: filterTree,
    searchTree: searchTree,

    // base
    hasOwnProp: hasOwnProp,
    eqNull: eqNull,
    isNaN: isNumberNaN,
    isFinite: isNumberFinite,
    isUndefined: isUndefined,
    isArray: isArray,
    isFloat: isFloat,
    isInteger: isInteger,
    isFunction: isFunction,
    isBoolean: isBoolean,
    isString: isString,
    isNumber: isNumber,
    isRegExp: isRegExp,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isDate: isDate,
    isError: isError,
    isTypeError: isTypeError,
    isEmpty: isEmpty,
    isNull: isNull,
    isSymbol: isSymbol,
    isArguments: isArguments,
    isElement: isElement,
    isDocument: isDocument,
    isWindow: isWindow,
    isFormData: isFormData,
    isMap: isMap,
    isWeakMap: isWeakMap,
    isSet: isSet,
    isWeakSet: isWeakSet,
    isLeapYear: isLeapYear,
    isMatch: isMatch,
    isEqual: isEqual,
    isEqualWith: isEqualWith,
    getType: getType,
    uniqueId: uniqueId,
    getSize: getSize,
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    findIndexOf: findIndexOf,
    findLastIndexOf: findLastIndexOf,
    toStringJSON: toStringJSON,
    toJSONString: toJSONString,
    keys: keys,
    values: values,
    entries: entries,
    pick: pick,
    omit: omit,
    first: first,
    last: last,
    each: each,
    forOf: forOf,
    lastForOf: lastForOf,
    lastEach: lastEach,
    has: has,
    get: get,
    set: set,
    groupBy: groupBy,
    countBy: countBy,
    clone: clone,
    clear: clear,
    remove: remove,
    range: range,
    destructuring: destructuring,

    // number
    random: random,
    min: min,
    max: max,
    commafy: commafy,
    round: round,
    ceil: ceil,
    floor: floor,
    toFixed: toFixed,
    toFixedString: toFixedString,
    toFixedNumber: toFixedNumber,
    toNumber: toNumber,
    toNumberString: toNumberString,
    toInteger: toInteger,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    sum: sum,
    mean: mean,

    // date
    now: now,
    timestamp: timestamp,
    isValidDate: isValidDate,
    isDateSame: isDateSame,
    toStringDate: toStringDate,
    toDateString: toDateString,
    getWhatYear: getWhatYear,
    getWhatMonth: getWhatMonth,
    getWhatWeek: getWhatWeek,
    getWhatDay: getWhatDay,
    getYearDay: getYearDay,
    getYearWeek: getYearWeek,
    getMonthWeek: getMonthWeek,
    getDayOfYear: getDayOfYear,
    getDayOfMonth: getDayOfMonth,
    getDateDiff: getDateDiff,

    // string
    trim: trim,
    trimLeft: trimLeft,
    trimRight: trimRight,
    escape: escape,
    unescape: unescape,
    camelCase: camelCase,
    kebabCase: kebabCase,
    repeat: repeat,
    padStart: padStart,
    padEnd: padEnd,
    startsWith: startsWith,
    endsWith: endsWith,
    template: template,
    toFormatString: toFormatString,
    toString: toValString,

    // function
    noop: noop,
    property: property,
    bind: bind,
    once: once,
    after: after,
    before: before,
    throttle: throttle,
    debounce: debounce,
    delay: delay,

    // url
    unserialize: unserialize,
    serialize: serialize,
    parseUrl: parseUrl,

    // web
    getBaseURL: getBaseURL,
    locat: locat,
    browse: browse,
    cookie: cookie
  })

  return XEUtils
}))
