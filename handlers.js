let draggableKeys;
let draggableTargets;
let dragSrcEl;
let swappable = false;

function dragAndDropInit() {
  draggableKeys = document.querySelectorAll('.draggable-key')
  draggableTargets = document.querySelectorAll('.draggable-target')

  // Add event listeners
  draggableTargets.forEach((target) => {
    target.addEventListener('dragstart', handleDragStart, false)
    target.addEventListener('dragend', handleDragEnd, false)
    target.addEventListener('dragover', handleDragOver, false)
    target.addEventListener('dragenter', handleDragEnter, false)
    target.addEventListener('dragleave', handleDragLeave, false)
    target.addEventListener('dragend', handleDragEnd, false)
    target.addEventListener('drop', handleDrop, false)
  })

  let inputAnswers = document.querySelectorAll('.input-answers')

  inputAnswers.forEach((input) => {
    input.style.cursor = input.value !== '' ? 'move' : 'auto'
  })
}

function clearInputField(pos, currstate=null) {
  var state = currstate ? currstate : currentstate();

  // Erase this square.
  state.answer[pos] = null;
  state.work[pos] = 0;

  // Immediate redraw of just the keyed cell.
  redraw(state, pos);
  // Commit state after a timeout
   setTimeout(function() {
    commitstate(state);
  }, 0);
}

function handleDragStart(e) {
  // Triggering log of when user started to drag item
  $(document).trigger('log', ['dragstart', 
  {
    'target_id': e.target.id, 
    'time': (new Date).getTime(), 
    'board_state': currentstate()
  }]);
  this.style.opacity = '0.4';

  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.childNodes[0].value);
}

function handleDragEnd(e) {
  $(document).trigger('log', ['drag ended',
   {
    'target_id': e.target.id, 
    'time': (new Date).getTime(), 
    'swapped': swappable 
  }]);
  this.style.opacity = '1'

  draggableTargets.forEach((target) => {
    target.classList.remove('over')
  })
}

function handleDrop(e) {
  $(document).trigger('log', ['element dropped',
   {
    'target_id': e.target.id, 
    'time': (new Date).getTime(), 
    'swapped': swappable, 
    'board_state': currentstate()
  }]);
  e.stopPropagation();

  if (dragSrcEl !== this) {
    let inputChild = this.childNodes[0]
    
    // Swap values if target value exists
    var state = currentstate();
    dragSrcEl.childNodes[0].value = swappable ? inputChild.value : ''
    let dragSrcPos = dragSrcEl.getAttribute('id').substr(2)

    state.answer[dragSrcPos] = parseInt(dragSrcEl.childNodes[0].value ? dragSrcEl.childNodes[0].value : 0) - 1;
    state.work[dragSrcPos] = 0;
    
    inputChild.value = e.dataTransfer.getData('text/html')
    
    let pos = this.getAttribute('id').substr(2)
    updateBoard(parseInt(inputChild.value) - 1, pos, e, state)
  }

  return false;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  this.classList.add('over')

  swappable = this.childNodes[0].value ? true : false;
  return false;
}

function handleDragEnter(e) {
  this.classList.add('over')
}

function handleDragLeave(e) {
  this.classList.remove('over')
}

function updateBoard(num, pos, ev, currstate=null) {
  var state = currstate ? currstate : currentstate();

  // Ignore the update if the square is given in the puzzle.
  if (state.puzzle[pos] !== null) return;

  if (ev.target.value && 
    (isNaN(parseInt(ev.target.value)) || !(parseInt(ev.target.value) >= 1 &&
    parseInt(ev.target.value) <= 4
    ))) 
  {
    ev.target.value = ''
    let pos = parseInt(ev.target.id.substr(2));
    clearInputField(pos)

    return
  }
  
  if (num == -1) {
    // Erase this square.
    state.answer[pos] = null;
    state.work[pos] = 0;
  } 
  else if (isalt(ev)) {
      // Undiscoverable: write small numbers if ctrl is pressed.
      state.answer[pos] = null;
      state.work[pos] ^= (1 << num);
    }
  else {
    // Set the number
    state.answer[pos] = num;
    state.work[pos] = 0;
    // Update elapsed time immediately, to avoid flicker upon victory.
    if (victorious(state)) {
      var now = (new Date).getTime();
      if (state.gentime > starttime) {
        starttime = state.gentime;
      }
      state.elapsed = (now - starttime);
      // Log the exact moment, along with the elapsed time in ms.
      $(document).trigger('log', ['victory', {
        elapsed: state.elapsed,
        seed: currentstate().seed
      }]);
    }
  }

  // Immediate redraw of just the keyed cell.
  redraw(state, pos);
  // Clear the current number.
  // setcurnumber(0);
  // Commit state after a timeout
  setTimeout(function() {
    commitstate(state);
  }, 0);
}

