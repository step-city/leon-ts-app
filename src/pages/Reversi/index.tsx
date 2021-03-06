import Utils from '@utils'
import { Button, Modal } from 'antd'
import React from 'react'
import './index.less'
import Tools from './tools'

interface IProps {
  isMobile: boolean;
}

interface IState {
  checkerboard: any[][];
  step: number;
  history: any[];
  size: number;
}

const statusMap = {
  empty: 0,
  black: 1,
  white: 2,
  blackHover: 3,
  whiteHover: 4
}

class Reversi extends React.Component<IProps, IState> {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.reset()
  }

  reset = () => {
    const { checkerboard, size } = this.initCheckerboard()
    const state = {
      checkerboard,
      history: [],
      step: 0,
      size
    }
    this.setState(state)
  }

  initCheckerboard = () => {
    const checkerboard = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
    return {
      checkerboard,
      size: this.flatten(checkerboard).length
    }
  }

  flatten = arr =>
    arr.reduce((a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), [])

  couldClick = ({ x, y }) => {
    const { checkerboard, step } = this.state
    return Tools.couldClick({ x, y, checkerboard, player: step % 2 })
  }

  itemMouseEnter = ({ rowIndex: x, itemIndex: y }) => {
    const { checkerboard, step } = this.state
    const { blackHover, whiteHover } = statusMap
    if (checkerboard[x][y] === statusMap.empty && this.couldClick({ x, y })) {
      checkerboard[x][y] = step % 2 === 0 ? blackHover : whiteHover
      this.setState({ checkerboard })
    }
  }

  itemMouseLeave = ({ rowIndex: x, itemIndex: y }) => {
    const { checkerboard } = this.state
    if (
      checkerboard[x][y] === statusMap.blackHover ||
      checkerboard[x][y] === statusMap.whiteHover
    ) {
      checkerboard[x][y] = statusMap.empty
      this.setState({ checkerboard })
    }
  }

  itemClick = ({ rowIndex: x, itemIndex: y }) => {
    const { checkerboard, step, history } = this.state
    const { black, white } = statusMap
    if (
      checkerboard[x][y] !== black &&
      checkerboard[x][y] !== white &&
      this.couldClick({ x, y })
    ) {
      checkerboard[x][y] = step % 2 === 0 ? black : white
      const { c, r } = Tools.clickToCover({
        x,
        y,
        checkerboard,
        player: step % 2
      })
      history.push({ curr: { x, y }, reverse: r })
      this.setState({
        checkerboard: c,
        step: history.length,
        history
      })
    }
  }

  pass = () => {
    const { history } = this.state
    history.push({})
    this.setState({
      step: history.length,
      history
    })
  }

  retract = () => {
    const { history, checkerboard } = this.state
    const { curr, reverse } = history.pop()
    if (curr) {
      const { x, y } = curr
      const { empty, black, white } = statusMap
      checkerboard[x][y] = empty
      reverse.forEach(r => {
        checkerboard[r.x][r.y] =
          checkerboard[r.x][r.y] === white ? black : white
      })
    }

    this.setState({ history, step: history.length, checkerboard })
  }

  renderItem = (item, rowIndex, itemIndex) => {
    const status = this.state.checkerboard[rowIndex][itemIndex]
    const { black, white, blackHover, whiteHover } = statusMap
    const className = status ? ['chosen'] : []
    if (className.length) {
      switch (status) {
        case black:
          className.push('black selected')
          break
        case white:
          className.push('white selected')
          break
        case blackHover:
          className.push('black')
          break
        case whiteHover:
          className.push('white')
          break
      }
    }
    return (
      <td
        className="item"
        key={itemIndex}
        onClick={Utils.handle(this.itemClick, { rowIndex, itemIndex })}
        onMouseOver={Utils.handle(this.itemMouseEnter, { rowIndex, itemIndex })}
        onMouseLeave={Utils.handle(this.itemMouseLeave, {
          rowIndex,
          itemIndex
        })}
      >
        <div className={className.join(' ')}>
          <div className="chess front" />
          <div className="chess back" />
        </div>
      </td>
    )
  }

  renderRow = (row, rowIndex) => (
    <tr className="row" key={rowIndex}>
      {row.map((item, itemIndex) => this.renderItem(item, rowIndex, itemIndex))}
    </tr>
  )

  getScore = () => {
    const { checkerboard } = this.state
    let black = 0
    let white = 0
    checkerboard.forEach(row =>
      row.forEach(item => {
        if (item === statusMap.black) {
          black++
        }
        if (item === statusMap.white) {
          white++
        }
      })
    )
    return { black, white }
  }

  isWin = ({ black, white, size }) => {
    let title = ''
    let content
    if (black + white === size) {
      if (black > white) {
        title = 'Victory'
        content = 'black wins'
      } else if (black < white) {
        title = 'Victory'
        content = 'white wins'
      } else {
        title = 'Peace'
        content = 'Draw'
      }
    } else if (!black || !white) {
      if (black) {
        title = 'Victory'
        content = 'black wins'
      } else if (white) {
        title = 'Victory'
        content = 'white wins'
      }
    }

    if (title && content) {
      Modal.info({ title, content })
    }
  }

  render() {
    const { checkerboard, history, step, size } = this.state
    const { isMobile } = this.props
    const { black, white } = this.getScore()
    const disablePass =
      black + white === size ||
      (history.length && Object.keys(history[history.length - 1]).length === 0)
    this.isWin({ black, white, size })
    return (
      <div className="reversi-wrapper">
        <div className="reversi-top">
          <div
            className={`top black ${isMobile ? '' : 'bigger'} ${
              step % 2 === 1 ? '' : 'current'
            }`}
          >
            {black}
          </div>
          <div
            className={`top white ${isMobile ? '' : 'bigger'} ${
              step % 2 === 1 ? 'current' : ''
            }`}
          >
            {white}
          </div>
        </div>
        <div className={isMobile ? 'checkerboard' : 'checkerboard bigger'}>
          <table>
            <tbody>{checkerboard.map(this.renderRow)}</tbody>
          </table>
        </div>
        <div className="reversi-bottom">
          <Button
            type="primary"
            disabled={history.length === 0}
            onClick={this.reset}
          >
            Reset
          </Button>
          <Button
            type="primary"
            disabled={disablePass ? true : false}
            onClick={this.pass}
          >
            Pass
          </Button>
          <Button
            type="primary"
            disabled={history.length === 0}
            onClick={this.retract}
          >
            Retract
          </Button>
        </div>
      </div>
    )
  }
}

export default Utils.connect({
  component: Reversi,
  mapStateToProps: state => ({
    isMobile: state.common.isMobile
  })
})
