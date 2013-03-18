# git-object-tag

git tag objects as javascript objects.

tag objects are immutable once created.

```javascript
var Buffer = require('buffer').Buffer
  , tag = require('git-object-tag')

var b = tag.create(new Buffer(...))

b = tag.read(<some git buffer>)

```

## API

#### tag.read(<git buffer>) -> Tag

read a tag from some git buffer data.

#### tag.create(tagger, object, type, tag, message, attrs) -> Tag

create a tag from some source data.

all fields (save for message) may be arrays.

#### Tag#tag() -> string
#### Tag#type() -> "commit" | "tag" | "blob" | "tree"
#### Tag#tagger() -> string
#### Tag#message() -> string
#### Tag#attr(attr) -> string | undefined

## License

MIT
