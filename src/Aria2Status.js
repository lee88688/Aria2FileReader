function oneHexTo4Bin (hex) {
  const bin = parseInt(hex, 16).toString(2)
  switch (bin.length) {
    case 4:
      return bin
    case 3:
      return '0' + bin
    case 2:
      return '00' + bin
    case 1:
      return '000' + bin
    default:
      throw new Error(`wrong hex${hex} number.`)
  }
}

class Aria2Status {
  constructor (status = {}) {
    this._parse(status)
  }

  update (status) {
    this._parse(status)
  }

  /**
   * get binary pieces between start bytes and stop bytes.
   * @param {Number} index
   * @param {Number} start bytes start at 0
   * @param {Number} stop bytes start at 0
   * @returns {String}
   */
  get (index, start, stop) {
    let file
    for (const f of this._files) {
      if (f.index === index) {
        file = f
        break
      }
    }
    if (!file) {
      return ''
    }
    let startPiece = Math.ceil((start + 1) / this._pieceLength)
    let stopPiece = Math.ceil((stop + 1) / this._pieceLength)
    const startPieceDiv4 = Math.ceil(startPiece / 4)
    const stopPieceDiv4 = Math.ceil(stopPiece / 4)
    const hexPieces = this._bitfield.slice(startPieceDiv4 - 1, stopPieceDiv4)
    const binPieces = hexPieces.split('').map(item => oneHexTo4Bin(item)).join('')
    const offsetPieces = (startPieceDiv4 - 1) * 4
    startPiece -= offsetPieces
    stopPiece -= offsetPieces
    return binPieces.slice(startPiece - 1, stopPiece)
  }

  isAvailable (index, start, stop) {
    const bin = this.get(index, start, stop)
    return ((1 << bin.length) - parseInt(bin, 2)) === 1
  }

  _parse (status) {
    if (!status) {
      return
    }
    const {
      gid,
      bitfield,
      pieceLength,
      numPieces,
      files,
      dir
    } = status
    let patchMode = false
    if (this._gid && this._gid !== gid) {
      console.warn('status is not the same as before!')
      return
    } else if (this._gid && this._gid === gid) {
      patchMode = true
    } else {
      this._gid = gid
      patchMode = false
    }
    let offset = 0
    for (const file of files) {
      file.length = parseInt(file.length)
      file.offset = offset
      offset += file.length
    }
    this._files = files
    this._dir = dir
    this._pieceLength = parseInt(pieceLength)
    this._numPieces = parseInt(numPieces)
    this._bitfield = bitfield
  }
}

module.exports = Aria2Status
