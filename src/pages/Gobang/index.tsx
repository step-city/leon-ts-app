import * as React from 'react'
import Utils from '@utils'
import './index.less'
import { Modal } from 'antd'

interface IProps {
  isMobile: boolean
}

interface IState {
  size: number,
  checkerboard: any[][],
  step: number,
  renju: number
}

class Gobang extends React.Component<IProps, IState> {
  componentWillMount() {
    this.reset()
  }

  reset = () => {
    const size = !this.props.isMobile ? 11 : 3
    const renju = !this.props.isMobile ? 5 : 3
    this.setState({
      size, renju,
      step: 0,
      checkerboard: this.calculateCheckerboard(size)
    })
  }

  // state 
  // 0: nothing, 1: hover, 2: black, 3: white
  calculateCheckerboard = size => {
    const result: any[][] = []
    for(let i = 0; i < size; i++) {
      const row: any[] = []
      for(let j = 0; j < size; j++) {
        row.push({ state: 0 })
      }
      result.push(row)
    }
    return result
  }

  mouseEnter = ({ rowIndex, itemIndex }) => {
    this.setCheckerboard({ state: 1, rowIndex, itemIndex })
  }

  mouseLeave = ({ rowIndex, itemIndex }) => {
    this.setCheckerboard({ state: 0, rowIndex, itemIndex })
  }

  itemClick = ({ rowIndex, itemIndex }) => {
    const { step } = this.state
    this.setCheckerboard({ state: step % 2 === 1 ? 3 : 2, rowIndex, itemIndex }, true)
  }

  setCheckerboard = ({ state, rowIndex, itemIndex }, isClick?) => {
    const { checkerboard, step } = this.state
    if (checkerboard[rowIndex][itemIndex].state !== 2 && checkerboard[rowIndex][itemIndex].state !== 3) {
      checkerboard[rowIndex][itemIndex] = { state }
      this.setState({ checkerboard, step: isClick ? step + 1 : step }, 
        () => {
          if (isClick && !this.isWin({ rowIndex, itemIndex, state })) {
            this.isPeace()
          }
        })
    }
  }

  isPeace = () => {
    const { size, step } = this.state 
    if (size * size === step) {
      Modal.info({
        title: 'Peace',
        content: `和`,
        onOk: this.reset
      })
    }
  }

  isWin = ({ rowIndex, itemIndex, state }) => {
    let isWin = this.isColumnWin({ rowIndex, itemIndex, state })
    if (!isWin) {
      isWin = this.isRowWin({ rowIndex, itemIndex, state })
    }
    if (!isWin) {
      isWin = this.isSkewWin({ rowIndex, itemIndex, state })
    }
    if (isWin) {
      Modal.info({
        title: 'Victory',
        content: `${state === 2 ? '黑' : '白'}胜`,
        onOk: this.reset
      })
    }
    return isWin
  }

  isColumnWin = ({ rowIndex, itemIndex, state }) => {
    const { size, checkerboard, renju } = this.state
    let result = 0
    for(let i = -(renju - 1); i <= renju - 1; i++) {
      if (rowIndex + i >= 0 
        && rowIndex + i < size
        && checkerboard[rowIndex + i][itemIndex].state === state
      ) {
        result++
      } else {
        result = 0
      }
      if (result === renju) {
        break
      }
    }
    return result === renju
  }

  isRowWin = ({ rowIndex, itemIndex, state }) => {
    const { size, checkerboard, renju } = this.state
    let result = 0
    for(let i = -(renju - 1); i <= renju - 1; i++) {
      if (itemIndex + i >= 0 
        && itemIndex + i < size
        && checkerboard[rowIndex][itemIndex + i].state === state
      ) {
        result++
      } else {
        result = 0
      }
      if (result === renju) {
        break
      }
    }
    return result === renju
  }

  isSkewWin = ({ rowIndex, itemIndex, state }) => {
    let result = this.isDownLineWin({ rowIndex, itemIndex, state })
    if (!result) {
      result = this.isUpLineWin({ rowIndex, itemIndex, state })
    }
    return result
  }

  isDownLineWin = ({ rowIndex, itemIndex, state }) => {
    const { size, checkerboard, renju } = this.state
    let result = 0
    for(let i = -(renju - 1); i <= renju - 1; i++) {
      if (itemIndex + i >= 0 
        && itemIndex + i < size
        && rowIndex + i >= 0
        && rowIndex + i < size
        && checkerboard[rowIndex + i][itemIndex + i].state === state
      ) {
        result++
      } else {
        result = 0
      }
      if (result === renju) {
        break
      }
    }
    return result === renju
  }

  isUpLineWin = ({ rowIndex, itemIndex, state }) => {
    const { size, checkerboard, renju } = this.state
    let result = 0
    for(let i = -(renju - 1); i <= renju - 1; i++) {
      if (itemIndex + i >= 0 
        && itemIndex + i < size
        && rowIndex - i >= 0
        && rowIndex - i < size
        && checkerboard[rowIndex - i][itemIndex + i].state === state
      ) {
        result++
      } else {
        result = 0
      }
      if (result === renju) {
        break
      }
    }
    return result === renju
  }

  renderItem = (item, rowIndex, itemIndex) => {
    const { state } = item
    const { step } = this.state
    let className = ''
    switch(state) {
      case 1:
        className = step % 2 !== 1 ? 'chosen black' : 'chosen white'
        break
      case 2:
        className = 'chosen black selected'
        break
      case 3:
        className = 'chosen white selected'
        break
    }
    return (
      <td className='item' key={itemIndex} 
        onClick={Utils.handle(this.itemClick, { rowIndex, itemIndex })}
        onMouseEnter={Utils.handle(this.mouseEnter, { rowIndex, itemIndex })}
        onMouseLeave={Utils.handle(this.mouseLeave, { rowIndex, itemIndex })}
      >
        <div className={className}/>
      </td>
    )
  }

  renderRow = (row, rowIndex) => (
    <tr className='row' key={rowIndex}>
      { row.map((item, itemIndex) => this.renderItem(item, rowIndex, itemIndex)) }
    </tr>
  )

  render() {
    const { checkerboard } = this.state
    return (
      <div className='gobang-wrapper'>
        <table>
          <tbody>
            { checkerboard.map(this.renderRow) }
          </tbody>
        </table>
      </div>
    )
  }
}

export default Utils.connect({
  component: Gobang,
  mapStateToProps: state => ({
    isMobile: state.common.isMobile
  }),
})