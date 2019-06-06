const Koa = require('koa')
const fs = require('fs')
const mime = require('mime-types')
const Aria2FileReader = require('./Aria2FileReader')

function rangeParse (str) {
  const token = str.split('=')
  if (!token || token.length !== 2 || token[0] !== 'bytes') {
    return null
  }
  return token[1]
    .split(',')
    .map(range => {
      return range.split('-').map(value => {
        if (value === '') {
          return Infinity
        }
        return Number(value)
      })
    })
    .filter(range => {
      return !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1]
    })
}

class Aria2StreamServer {
  constructor (port) {
    this._app = new Koa()
    this._app.use(this.streamMiddleware.bind(this))
    this._port = port
    this._reader = {}
  }

  start () {
    this._app.listen(this._port)
  }

  add (gid) {
    if (gid in this._reader) {
      return
    }
    this._reader[gid] = new Aria2FileReader()
  }

  remove (gid) {
    if (gid in this._reader) {
      delete this._reader[gid]
    }
  }

  update (gid, status) {
    if (!(gid in this._reader)) {
      return
    }
    this._reader[gid].update(status)
  }

  async streamMiddleware (ctx) {
    // parse path to get gid and index
    const [gid, index] = ctx.path.split('/').filter(item => item)
    if (!(gid in this._reader) || !this._reader[gid].select(index)) {
      ctx.status = 404
      ctx.body = 'gid or index is not found!'
      return
    }
    const file = this._reader[gid]._file
    let range = ctx.header.range
    if (!range) {
      range = 'bytes=0-'
    }
    const ranges = rangeParse(range)
    let [start, end] = ranges[0]
    // range check
    const availableLength = this._reader[gid].availableLength()
    if (start < availableLength && end >= availableLength) {
      end = availableLength - 1
    } else if (start >= availableLength) {
      // ctx.status = 416
      // return
    }
    end = end === Infinity ? file.length - 1 : end
    const path = file.path
    const fileSize = file.length
    ctx.status = 206
    const contentType = mime.lookup(path)
    contentType && ctx.set('Content-Type', contentType)
    ctx.set('Accept-Ranges', 'bytes')
    ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`)
    ctx.set('Content-Length', end - start + 1)
    ctx.body = fs.createReadStream(path, { start, end })
  }
}

module.exports = Aria2StreamServer
