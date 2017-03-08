'use strict';
(() => {
  const FIELD_FREE = -2
  const FIELD_BLOCKED = -1

  function NsMasonry( {containerId, colWidth, rowHeight, invertX, invertY, animate} ) {
    if (!containerId || !colWidth || !rowHeight) throw new Error('call with {containerId, colWidth, rowHeight}');
    const self = this
    self.update = update

    let query = $('#' + containerId)
    if (!query || query.length === 0) return;
    let container = query[0]
    let hProperty, vProperty

    init()
    return self

    function update() {
      const containerWidth = container.clientWidth
      const columnCount = Math.floor(containerWidth / colWidth);
      let items, grid
      grid = createGrid( {columnCount} )
      items = container.children
      for (let i = 0; i < items.length; i++) {
        let element, width, height
        width = items[i].offsetWidth
        height = items[i].offsetHeight
        element = {
          width: Math.floor(width / colWidth),
          height: Math.floor(height / rowHeight),
          id: i
        }
        grid.fitElement(element)
      }
      grid.printGrid()
      applyLayout( {layout: grid.getGrid(), items, container} )
    }

    function applyLayout( {layout, items, container}) {
      if (layout.length === 0) return
      const height = layout.length
      const width = layout[0].length
      for (let iR = 0; iR < height; iR++) {
        for (let iC = 0; iC < width; iC++) {
          let field = layout[iR][iC]
          if (field > FIELD_BLOCKED) {
            let item = items[field]
            if (item && item.style) {
              let vOffset = iR * rowHeight
              let hOffset = iC * colWidth
              item.style[vProperty] = vOffset + 'px'
              item.style[hProperty] = hOffset + 'px'
              console.log('setting ' + field + ' to ' + vOffset + ', ' + hOffset)
            }
          }
        }
      }
      container.style.height = (height * rowHeight) + 'px'
    }

    function init() {
      vProperty = invertY ? 'bottom' : 'top'
      hProperty = invertX ? 'right' : 'left'
      let items = container.children
      for (let i = 0; i < items.length; i++) {
        if (animate && items[i].style) {
          items[i].style[vProperty] = $(window).height() + 'px'
        }
      }
      update()
    }

  }

  function createGrid( {columnCount} ) {
    let grid
    grid = []

    return {
      fitElement,
      getGrid,
      printGrid
    }

    function fitElement(element) {
      let row, col
      for (row = 0; row <= grid.length; row++) {
        col = fitsInRow( {row, element} )
        if (col > -1) break
      }
      if (row + element.height > grid.length) {
        let rowsToAdd = row + element.height - grid.length
        console.log('adding ' + rowsToAdd + 'rows');
        addRows(rowsToAdd)
      }
      placeElement( {element, row, col} )
    }

    function fitsInRow( {row, element} ) {
      //returns the index where the element would fit or -1 if it does not.
      //check for index targeting a new row
      if (row >= grid.length) return 0
      //move element inside the row and check if it fits
      for (let col = 0; col < columnCount; col++) {
        //element is too fat
        if (col + element.width > columnCount) return -1
        if (fitsAtPosition( {element, row, col} )) return col
      }
      return -1
    }

    function fitsAtPosition( {element, row, col} ) {
      for (let iC = 0; iC < element.width; iC++) {
        for (let iR = 0; iR < element.height; iR++) {
          if (row + iR >= grid.length) break
          if (grid[row + iR][col + iC] > FIELD_FREE) {
            return false
          }
        }
      }
      return true
    }

    function placeElement( {element, row, col} ) {
      //block spots according to width and height
      for (let iR = 0; iR < element.height; iR++) {
        //in every row block these spots
        for (let iC = 0; iC < element.width; iC++) {
          grid[row + iR][col + iC] = FIELD_BLOCKED
        }
      }
      //add element origin to grid
      grid[row][col] = element.id
    }

    function addRows(count) {
      if (count < 1) return
      for (let i = 0; i < count; i++) {
        grid.push(Array(columnCount).fill(FIELD_FREE))
      }
    }

    function getGrid() {
      return grid
    }

    function printGrid() {
      let out = ''
      for (let iR = 0; iR < grid.length; iR++) {
        for (let iC = 0; iC < columnCount; iC++) {
          let val = grid[iR][iC]
          out += (val > -1 ? ' ' : '') + val + ' '
        }
        out += '\n'
      }
      console.log(out)
    }

  }


  window.NsMasonry = NsMasonry
})()