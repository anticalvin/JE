(() => {
  const world = document.getElementById('world');
  const root = document.documentElement;
  const trace = document.getElementById('trace-log');
  const scannerLabel = document.getElementById('scanner-label');
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  let scanning = false;
  let traceCounter = 0;
  let lastTraceAt = 0;

  const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  function log(message, kind = 'TRACE') {
    const row = document.createElement('div');
    row.innerHTML = `<b>${kind}</b> ${stamp()} ${message}`;
    trace.prepend(row);
    while (trace.children.length > 18) trace.lastElementChild.remove();
  }

  function setScanPoint(x, y) {
    root.style.setProperty('--scan-x', `${x}px`);
    root.style.setProperty('--scan-y', `${y}px`);
    scannerLabel.textContent = `SCAN / ${String(++traceCounter).padStart(3, '0')}`;
    const now = performance.now();
    if (now - lastTraceAt > 900) {
      log(`surface coordinate ${Math.round(x)}:${Math.round(y)}`);
      lastTraceAt = now;
    }
  }

  function armScanner(force) {
    scanning = typeof force === 'boolean' ? force : !scanning;
    world.dataset.scanning = String(scanning);
    root.style.setProperty('--scan-r', scanning ? (coarsePointer ? '0px' : '190px') : '0px');
    log(scanning ? 'surface scanner armed' : 'surface scanner parked', scanning ? 'SCAN' : 'IDLE');
    if (coarsePointer && scanning) enterNetwork();
  }

  function enterNetwork() {
    world.dataset.state = 'network';
    world.dataset.scanning = 'false';
    scanning = false;
    root.style.setProperty('--scan-r', '150vmax');
    log('public underlayer opened', 'BREACH');
  }

  function returnSurface() {
    world.dataset.state = 'surface';
    root.style.setProperty('--scan-r', '0px');
    log('returned to printed surface', 'SURFACE');
  }

  document.addEventListener('pointermove', (event) => {
    if (!scanning || world.dataset.state === 'network' || coarsePointer) return;
    setScanPoint(event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;

    if (event.code === 'Space') {
      event.preventDefault();
      world.dataset.state === 'network' ? returnSurface() : enterNetwork();
    }
    if (event.key === 'Enter' && world.dataset.state !== 'network') enterNetwork();
    if (event.key === 'Escape' && world.dataset.state === 'network') returnSurface();
    if (event.key.toLowerCase() === 's' && world.dataset.state !== 'network') armScanner();
  });

  document.querySelectorAll('[data-action="scan"]').forEach((button) => {
    button.addEventListener('click', () => armScanner());
  });

  document.querySelectorAll('[data-action="surface"]').forEach((button) => {
    button.addEventListener('click', returnSurface);
  });

  document.querySelectorAll('.node').forEach((node) => {
    node.addEventListener('mouseenter', () => log(`route found: ${node.querySelector('strong')?.textContent || 'NODE'}`, 'NODE'));
    node.addEventListener('focus', () => log(`route focused: ${node.querySelector('strong')?.textContent || 'NODE'}`, 'NODE'));
  });

  document.querySelectorAll('.story').forEach((story) => {
    story.addEventListener('mouseenter', () => {
      if (!scanning) return;
      log(`surface file ${story.dataset.coordinate || 'UNKNOWN'} exposed`, 'FILE');
    });
  });

  setScanPoint(innerWidth * 0.5, innerHeight * 0.5);
  log('JE surface mounted');
  log('NETWORK substrate detected');
  log(coarsePointer ? 'tap SCAN PAGE to enter underlayer' : 'select SCAN PAGE, then move pointer');
})();
