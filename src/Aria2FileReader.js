const fs = require('fs')
const Aria2Status = require('./Aria2Status')

class Aria2FileReader {
  constructor () {
    this._status = new Aria2Status()
    this._index = '1'
    this._file = null
  }

  update (s) {
    this._status.update(s)
  }

  select (index) {
    const files = this._status._files
    for (const f of files) {
      if (f.index === index || f.path.includes(index)) {
        this._file = f
        this._index = f.index
        return true
      }
    }
    return false
  }

  availableLength () {
    return this._status.getAvailableLength(this._index)
  }

  readableStream (start, end) {
    return fs.createReadStream(this._file.path, { start, end })
  }
}

module.exports = Aria2FileReader
