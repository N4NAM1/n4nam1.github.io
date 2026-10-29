// 封面即播放/暂停按钮，图标由 Spotify 的实际播放状态驱动。
(() => {
  const choices = Array.from(document.querySelectorAll('.music-choice'));
  const mount = document.getElementById('spotify-controller');
  const link = document.getElementById('music-open');
  const status = document.getElementById('music-status');
  if (!choices.length || !mount || !link) return;

  let current = choices[0];
  let controller = null;
  let ready = false;
  let loadedTrack = '';
  let desiredPlay = false;
  let phase = 'paused';
  let timeout;

  function render(message) {
    choices.forEach(button => {
      const selected = button === current;
      const playing = selected && phase === 'playing';
      button.dataset.selected = String(selected);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-busy', String(selected && phase === 'loading'));
      button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${button.dataset.title}`);
      button.querySelector('.music-symbol').textContent = playing ? '❚❚' : selected && phase === 'loading' ? '…' : '▶';
    });
    link.href = `https://open.spotify.com/track/${current.dataset.track}`;
    if (message && status) status.textContent = message;
  }

  function armTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (phase !== 'loading') return;
      desiredPlay = false;
      phase = 'paused';
      if (controller && ready) controller.pause();
      render('Playback could not start here. Try Open in Spotify ↗.');
    }, 12000);
  }

  function start() {
    if (!controller || !ready || !desiredPlay) return;
    if (loadedTrack !== current.dataset.track) {
      controller.pause();
      controller.loadUri(`spotify:track:${current.dataset.track}`);
      loadedTrack = current.dataset.track;
    }
    controller.play();
  }

  window.onSpotifyIframeApiReady = api => {
    loadedTrack = current.dataset.track;
    api.createController(mount, { uri: `spotify:track:${loadedTrack}`, width: 300, height: 80 }, embed => {
      controller = embed;
      embed.addListener('ready', () => {
        ready = true;
        start();
      });
      embed.addListener('playback_started', event => {
        if (event.data.playingURI !== `spotify:track:${current.dataset.track}`) return;
        if (!desiredPlay) { embed.pause(); return; }
        phase = 'playing';
        clearTimeout(timeout);
        render(`Playing · ${current.dataset.title}`);
      });
      embed.addListener('playback_update', event => {
        const state = event.data;
        if (state.playingURI && state.playingURI !== `spotify:track:${current.dataset.track}`) return;
        if (!desiredPlay) {
          if (!state.isPaused) embed.pause();
          return;
        }
        if (!state.isPaused && !state.isBuffering) {
          phase = 'playing';
          clearTimeout(timeout);
          render(`Playing · ${current.dataset.title}`);
        } else if (state.isPaused && phase === 'playing') {
          desiredPlay = false;
          phase = 'paused';
          render(`Paused · ${current.dataset.title}`);
        }
      });
      const iframe = document.querySelector('.spotify-engine iframe');
      if (iframe) {
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('loading', 'eager');
      }
    });
  };

  choices.forEach(button => {
    button.addEventListener('click', () => {
      if (button === current && desiredPlay) {
        desiredPlay = false;
        phase = 'paused';
        clearTimeout(timeout);
        if (controller && ready) controller.pause();
        render(`Paused · ${current.dataset.title}`);
        return;
      }
      current = button;
      desiredPlay = true;
      phase = 'loading';
      render(`Loading · ${current.dataset.title}`);
      armTimeout();
      start();
    });
  });

  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  script.onerror = () => {
    desiredPlay = false;
    phase = 'paused';
    clearTimeout(timeout);
    render('Spotify could not load. Use Open in Spotify ↗.');
  };
  document.head.appendChild(script);
  render();
})();
