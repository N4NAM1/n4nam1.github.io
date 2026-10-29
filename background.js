// 立体粒子连线背景，无外部依赖。只需调整这里的设置。
(() => {
  const settings = {
    density: 9000,       // 数值越小，点越多（桌面最多 120 个）
    connection: 160,     // 连线距离，单位像素
    speed: 12,           // 动画速度，越大越快
    intensity: 1        // 亮度，建议 0.5–1.5
  };
  const canvas = document.getElementById('network-background');
  const button = document.getElementById('background-toggle');
  const context = canvas.getContext('2d');
  if (!context) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, active: false };
  let paused = reducedMotion.matches;
  let width = 0, height = 0, points = [], frame = 0, previousTime = 0, time = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const limit = width < 600 ? 44 : 120;
    const count = Math.min(limit, Math.max(32, Math.round(width * height / settings.density)));
    points = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const vertical = Math.random() * 2 - 1;
      const radius = Math.cbrt(Math.random());
      const ring = Math.sqrt(1 - vertical * vertical) * radius;
      return {
        x: Math.cos(angle) * ring,
        y: vertical * radius,
        z: Math.sin(angle) * ring,
        group: i % 2,
        phase: Math.random() * Math.PI * 2,
        offsetX: 0, offsetY: 0
      };
    });
    draw(false);
  }

  function project(reactToPointer) {
    return points.map(point => {
      const direction = point.group ? -1 : 1;
      const angle = time * 0.085 * direction + point.group * 0.8;
      const x = point.x * Math.cos(angle) - point.z * Math.sin(angle);
      const z = point.x * Math.sin(angle) + point.z * Math.cos(angle);
      const depth = 1 / (1 - z * 0.24);
      const spread = Math.min(300, width * (width < 600 ? 0.7 : 0.29));
      const centerX = width * (point.group ? 0.94 : 0.06);
      const centerY = height * (point.group ? 0.68 : 0.34);
      const baseX = centerX + x * spread * depth;
      const baseY = centerY + point.y * Math.min(430, height * 0.62) * depth + Math.sin(time * 0.35 + point.phase) * 7;
      let offsetX = 0, offsetY = 0;
      if (pointer.active) {
        const dx = baseX - pointer.x, dy = baseY - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 180) {
          const force = Math.pow(1 - distance / 180, 2) * 42;
          offsetX = dx / Math.max(1, distance) * force;
          offsetY = dy / Math.max(1, distance) * force;
        }
      }
      if (reactToPointer) {
        point.offsetX += (offsetX - point.offsetX) * 0.09;
        point.offsetY += (offsetY - point.offsetY) * 0.09;
      }
      return {
        x: baseX + point.offsetX, y: baseY + point.offsetY,
        depth, phase: point.phase, group: point.group,
        hue: point.group ? 255 - z * 18 : 205 + z * 14
      };
    });
  }

  function dot(x, y, size, hue, alpha, glow = false) {
    if (glow) {
      const gradient = context.createRadialGradient(x, y, 0, x, y, size * 5);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 64%, ${alpha * 0.35})`);
      gradient.addColorStop(1, `hsla(${hue}, 90%, 64%, 0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, size * 5, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = `hsla(${hue}, 80%, 57%, ${alpha})`;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  function draw(reactToPointer = true) {
    context.clearRect(0, 0, width, height);
    const projected = project(reactToPointer);
    const degree = new Uint8Array(projected.length);
    let edge = 0;
    for (let i = 0; i < projected.length; i++) {
      const a = projected[i];
      for (let j = i + 1; j < projected.length; j++) {
        const b = projected[j];
        if (a.group !== b.group || degree[i] >= 5 || degree[j] >= 5) continue;
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > settings.connection || distance < 12) continue;
        degree[i]++; degree[j]++;
        const hue = (a.hue + b.hue) / 2;
        const opacity = (0.08 + (1 - distance / settings.connection) * 0.4) * settings.intensity;
        context.strokeStyle = `hsla(${hue}, 70%, 61%, ${opacity})`;
        context.lineWidth = (a.depth + b.depth) * 0.38;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
        // 少量光点沿着连线滑动，避免每条边同时发亮。
        if (edge++ % 11 === 0) {
          const progress = (time * 0.16 + a.phase / (Math.PI * 2)) % 1;
          dot(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress,
            1.6, hue - 10, 0.8 * settings.intensity, true);
        }
      }
    }
    for (const point of projected) {
      const breathing = 0.8 + Math.sin(time * 0.8 + point.phase) * 0.15;
      dot(point.x, point.y, 1.7 * point.depth, point.hue,
        Math.min(1, 0.7 * point.depth * breathing * settings.intensity), true);
    }
  }

  function animate(now) {
    frame = requestAnimationFrame(animate);
    if (!previousTime) previousTime = now;
    const elapsed = now - previousTime;
    if (elapsed < 1000 / 30) return;
    time += Math.min(elapsed / 1000, 0.05) * settings.speed / 12;
    previousTime = now;
    draw();
  }

  function update() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (button) {
      button.textContent = paused ? '播放背景' : '暂停背景';
      button.setAttribute('aria-pressed', String(paused));
    }
    if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
  }
  if (button) {
    button.hidden = false;
    button.addEventListener('click', () => { paused = !paused; update(); });
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) pointer.active = false; });
  window.addEventListener('blur', () => { pointer.active = false; });
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', event => { paused = event.matches; update(); });
  resize();
  update();
})();
