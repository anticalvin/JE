const reveals = [...document.querySelectorAll('.reveal')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  reveals.forEach((node) => observer.observe(node));
} else {
  reveals.forEach((node) => node.classList.add('in'));
}

const status = document.querySelector('[data-status-time]');
if (status) {
  const paintTime = () => {
    status.textContent = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  };
  paintTime();
  setInterval(paintTime, 30000);
}
