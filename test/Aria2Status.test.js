const expect = require('chai').expect
const Aria2Status = require('../src/Aria2Status')

function statusConfig () {
  return {
    bitfield: '8f0f000000',
    completedLength: '901120',
    dir: '/downloads',
    files: [
      {
        index: '1',
        length: '8388608', // 8 pieces
        path: '/downloads/file'
      },
      {
        index: '2',
        length: '34896138',
        path: '/downloads/file'
      }
    ],
    gid: '2089b05ecca3d829',
    numPieces: '34',
    pieceLength: '1048576',
    status: 'active',
    totalLength: '34896138'
  }
}

// eslint-disable-next-line no-undef
describe('Aria2Status', function () {
  // eslint-disable-next-line no-undef
  it('Aria2Status.get', function () {
    const status = statusConfig()
    const pieceLength = parseInt(status.pieceLength)
    const as = new Aria2Status(status)
    expect(as.get('1', 0, pieceLength * 4 + 10)).to.equal('10001')
    expect(as.get('1', pieceLength, pieceLength * 3)).to.equal('000')
    expect(as.get('2', 0, pieceLength * 4 + 10)).to.equal('00001')
  })
  // eslint-disable-next-line no-undef
  it('Aria2Status.getAvailableLength', function () {
    const status = statusConfig()
    const pieceLength = parseInt(status.pieceLength)
    const as = new Aria2Status(status)
    expect(as.getAvailableLength('1')).to.equal(pieceLength)
    expect(as.getAvailableLength('2')).to.equal(0)
  })
})
