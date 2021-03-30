let draggableKeys;
let draggableTargets;
let dragSrcEl;

function dragAndDropinit() {
  draggableKeys = document.querySelectorAll('.draggable-key')
  draggableTargets = document.querySelectorAll('.draggable-target')

  // Add event listeners
  draggableKeys.forEach((key) => {
    key.addEventListener('dragstart', handleDragStart, false)
    key.addEventListener('dragend', handleDragEnd, false)
  })
  
  draggableTargets.forEach((target) => {
    target.addEventListener('dragover', handleDragOver, false)
    target.addEventListener('dragenter', handleDragEnter, false)
    target.addEventListener('dragleave', handleDragLeave, false)
    target.addEventListener('dragend', handleDragEnd, false)
    target.addEventListener('drop', handleDrop, false)
  })
}

function handleDragStart(e) {
  this.style.opacity = '0.4';

  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.style.opacity = '1'

  draggableTargets.forEach((target) => {
    target.classList.remove('over')
  })
}

function handleDrop(e) {
  e.stopPropagation();

  if (dragSrcEl !== this) {
    this.innerHTML = e.dataTransfer.getData('text/html')
  }

  return false;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  this.classList.add('over')

  return false;
}

function handleDragEnter(e) {
  this.classList.add('over')
}

function handleDragLeave(e) {
  this.classList.remove('over')
}

