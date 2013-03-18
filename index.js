module.exports = {read: read, create: create}

function Tag(message, attrs, _raw, _raw_header) {
  this._attrs = attrs
  this._raw = _raw
  this._message = message
  this._header = _raw_header 
}

var cons = Tag
  , proto = cons.prototype

proto.type = 4 
proto.looseType = 'tag'

proto.object = function() {
  return (this._attrs.object || [])[0]
}

proto.objects = function() {
  return (this._attrs.object || []).slice()
}

proto.tag = function() {
  return (this._attrs.tag || [])[0]
}

proto.tags = function() {
  return (this._attrs.tag || []).slice()
}

proto.type = function() {
  return (this._attrs.type || [])[0]
}

proto.types = function() {
  return (this._attrs.type || []).slice()
}

proto.tagger = function() {
  return (this._attrs.tagger || [])[0]
}

proto.taggers = function() {
  return (this._attrs.tagger || []).slice()
}

proto.message = function() {
  return this._message
}

proto.attr = function(attr) {
  return (this._attrs[attr] || []).slice()
}

function read(buf) {
  var idx = 0
    , len = buf.length
    , _char
    , _last

  var raw_header = [[0]]
    , current = raw_header[0]
    , current_len = 1
    , attrs = {}
    , message
    , attr
    , val

  do {
    _char = buf.readUInt8(idx++)
    if(current.length === 1 && _char === 10) {
      --raw_header.length
      break
    } else if(current.length === 1 && _char === 32) {
      current[current.length] = idx - 1
    } else if(_char === 10) {
      current[current.length] = idx - 1

      attr = buf.slice(current[0], current[1]).toString('utf8')
      val = buf.slice(current[1] + 1, current[2]).toString('utf8')

      attrs[attr] = attrs[attr] || []
      attrs[attr].push(val)

      current = raw_header[raw_header.length] = [idx]
    }
    _last = _char
  } while(idx < len)

  message = buf.slice(idx).toString('utf8')

  return new Tag(message, attrs, buf, raw_header) 
}

function create(tagger, object, type, tag, message, attrs) {
  attrs = attrs || {}
  message = message || ''
  object = object || ''

  attrs.tagger = Array.isArray(tagger) ? tagger : [tagger]
  attrs.object = Array.isArray(object) ? object : [object]
  attrs.type = Array.isArray(type) ? type : [type]
  attrs.tag = Array.isArray(tag) ? tag : [tag]

  return new Tag(message, attrs)
}
