const fs = require('fs')
const Aria2Status = require('./Aria2Status')

class Aria2FileReader {
  constructor () {
    this._status = new Aria2Status()
    this._index = '1'
  }

  update (s) {
    this._status(s)
  }

  select (index) {
    const files = this._status._files
    for (const f of files) {
      if (f.index === index || f.path.includes(index)) {
        this._index = f.index
        break
      }
    }
  }

  readableStream (start, end) {
    if (!this._status.isAvailable(this._index, start, end)) {
      return
    }
    const files = this._status._files
    let file
    for (const f of files) {
      if (f.index === this._index) {
        file = f
      }
    }
    return fs.createReadStream(file.path, { start, end })
  }
}

module.exports = Aria2FileReader
