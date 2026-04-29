/**
 * 五子棋胜负判定算法
 * 检查最后落子位置四个方向是否形成五连
 */
export function checkWin(board: number[][], x: number, y: number, player: number): boolean {
  const directions = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 对角线
    [1, -1],  // 反对角线
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    // 正方向计数
    for (let i = 1; i < 5; i++) {
      if (board[y + i * dy]?.[x + i * dx] === player) count++
      else break
    }
    // 反方向计数
    for (let i = 1; i < 5; i++) {
      if (board[y - i * dy]?.[x - i * dx] === player) count++
      else break
    }
    if (count >= 5) return true
  }
  return false
}

/**
 * 创建空棋盘
 */
export function createEmptyBoard(size: number = 15): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0))
}
