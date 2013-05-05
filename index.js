module.exports = {read: read, create: create}

var binary = require('bops')

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

proto.serialize = function() {
  if(this._raw) {
    return this._raw
  }

  var buffers = []
    , keybuf
    , blen
    , buf

  for(var key in this._attrs) {
    keybuf = binary.from(key+' ', 'utf8')

    for(var i = 0, len = this._attrs[key].length; i < len; ++i) {
      buffers.push(keybuf)
      buf = binary.from(this._attrs[key][i]+'\n', 'utf8')
      buffers.push(buf) 
    }
  }

  buf = binary.from('\n'+this._message, 'utf8')
  buffers.push(buf)

  return binary.join(buffers)
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
    _char = buf[idx++]
    if(current.length === 1 && _char === 10) {
      --raw_header.length
      break
    } else if(current.length === 1 && _char === 32) {
      current[current.length] = idx - 1
    } else if(_char === 10) {
      current[current.length] = idx - 1

      attr = binary.to(binary.subarray(buf, current[0], current[1]), 'utf8')
      val = binary.to(binary.subarray(buf, current[1] + 1, current[2]), 'utf8')

      attrs[attr] = attrs[attr] || []
      attrs[attr].push(val)

      current = raw_header[raw_header.length] = [idx]
    }
    _last = _char
  } while(idx < len)

  message = binary.to(binary.subarray(buf, idx), 'utf8')

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
