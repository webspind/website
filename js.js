/* Click on each icon to open the corresponding window */
/* For clearer code and file organization, feel free to check it out on https://gitlab.com/css-only/css-only-retro-desktop */

// Make windows closeable by unchecking the corresponding icon checkbox
document.addEventListener('DOMContentLoaded', function() {
    // Get all close buttons in windows
    const closeButtons = document.querySelectorAll('.window__control__button--right--align');
    
    closeButtons.forEach(closeButton => {
        // Only add click handler to buttons with close icon (X)
        if (closeButton.querySelector('.window__control__button__drawing__close')) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Find the parent window
                const window = this.closest('.window');
                if (window) {
                    // Get window ID (e.g., "window--my--pc")
                    const windowId = window.id;
                    
                    // Convert window ID to icon checkbox ID (e.g., "icon--my--pc--input")
                    // Remove "window--" prefix and add "icon--" prefix and "--input" suffix
                    const checkboxId = windowId.replace('window--', 'icon--') + '--input';
                    
                    // Find and uncheck the corresponding checkbox
                    const checkbox = document.getElementById(checkboxId);
                    if (checkbox) {
                        checkbox.checked = false;
                    }
                }
            });
        }
    });
    // Create taskbar and start menu if not present
    if (!document.querySelector('.taskbar')) {
        const taskbar = document.createElement('div');
        taskbar.className = 'taskbar';
        const startBtn = document.createElement('button');
        startBtn.className = 'start-button';
        startBtn.textContent = 'Start';
        const menu = document.createElement('div');
        menu.className = 'start-menu';
        menu.hidden = true;
        menu.innerHTML = `
            <button class="start-menu-item" data-open-window="window--text--editor">Velkomstbrev</button>
            <button class="start-menu-item" data-open-window="window--my--notes">Dokumenter</button>
            <button class="start-menu-item" data-open-window="window--music--player">Music Player</button>
        `;
        startBtn.addEventListener('click', ()=>{ menu.hidden = !menu.hidden; });
        document.addEventListener('click', (e)=>{
            if (!menu.contains(e.target) && e.target !== startBtn) menu.hidden = true;
        });
        taskbar.appendChild(startBtn);
        taskbar.appendChild(menu);
        document.body.appendChild(taskbar);

        // Start menu actions
        menu.addEventListener('click', (e)=>{
            const item = e.target.closest('.start-menu-item');
            if (!item) return;
            const windowId = item.getAttribute('data-open-window');
            const checkboxId = windowId.replace('window--','icon--') + '--input';
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
                menu.hidden = true;
            }
        });
    }
});

// Draggable windows via title bar
(function enableDraggableWindows() {
    const desktopWindowsContainer = document.querySelector('.windows');
    if (!desktopWindowsContainer) return;

    let activeWindow = null;
    let startMouseX = 0;
    let startMouseY = 0;
    let startLeft = 0;
    let startTop = 0;
    let currentZ = 10; // base z-index for windows we bring to front
    let isDragging = false;

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function onMouseMove(e) {
        if (!activeWindow) return;
        isDragging = true;
        const containerRect = desktopWindowsContainer.getBoundingClientRect();
        const windowRect = activeWindow.getBoundingClientRect();

        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;

        let nextLeftPx = startLeft + deltaX;
        let nextTopPx = startTop + deltaY;

        // Constrain within container bounds
        const maxLeft = containerRect.width - windowRect.width;
        const maxTop = containerRect.height - windowRect.height;

        nextLeftPx = clamp(nextLeftPx, 0, Math.max(0, maxLeft));
        nextTopPx = clamp(nextTopPx, 0, Math.max(0, maxTop));

        activeWindow.style.left = `${nextLeftPx}px`;
        activeWindow.style.top = `${nextTopPx}px`;
    }

    function onMouseUp() {
        if (!activeWindow) return;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        // Persist position
        try {
            const key = `window-pos:${activeWindow.id}`;
            localStorage.setItem(key, JSON.stringify({ left: activeWindow.style.left, top: activeWindow.style.top }));
        } catch (_) {}
        activeWindow.classList.remove('window--active');
        isDragging = false;
        activeWindow = null;
    }

    function beginDrag(winEl, e) {
        // Only left mouse button
        if (e.button !== 0) return;
        activeWindow = winEl;
        const containerRect = desktopWindowsContainer.getBoundingClientRect();
        const windowRect = activeWindow.getBoundingClientRect();

        // Ensure window is absolutely positioned relative to .windows
        const computedStyle = window.getComputedStyle(activeWindow);
        if (computedStyle.position !== 'absolute') {
            activeWindow.style.position = 'absolute';
        }

        // Initialize left/top if not set (convert from current rect)
        if (!activeWindow.style.left) {
            activeWindow.style.left = `${windowRect.left - containerRect.left}px`;
        }
        if (!activeWindow.style.top) {
            activeWindow.style.top = `${windowRect.top - containerRect.top}px`;
        }

        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startLeft = parseFloat(activeWindow.style.left) || 0;
        startTop = parseFloat(activeWindow.style.top) || 0;

        // Bring to front
        currentZ += 1;
        activeWindow.style.zIndex = String(currentZ);
        document.querySelectorAll('.window').forEach(w => w.classList.remove('window--active'));
        activeWindow.classList.add('window--active');

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Delegate mousedown on title bars
    desktopWindowsContainer.addEventListener('mousedown', function(e) {
        const controlBtn = e.target.closest('.window__control__button');
        if (controlBtn) return; // don't start drag from buttons
        const titleBar = e.target.closest('.window__title__bar');
        if (!titleBar) return;
        const winEl = titleBar.closest('.window');
        if (!winEl) return;
        beginDrag(winEl, e);
    });

    // Bring to front on focus/click inside window
    desktopWindowsContainer.addEventListener('mousedown', function(e) {
        const winEl = e.target.closest('.window');
        if (!winEl) return;
        currentZ += 1;
        winEl.style.zIndex = String(currentZ);
        document.querySelectorAll('.window').forEach(w => w.classList.remove('window--active'));
        winEl.classList.add('window--active');
    });

    // Restore saved positions
    document.querySelectorAll('.window').forEach(winEl => {
        try {
            const key = `window-pos:${winEl.id}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const pos = JSON.parse(saved);
                if (pos.left) winEl.style.left = pos.left;
                if (pos.top) winEl.style.top = pos.top;
            }
        } catch (_) {}
    });
})();

// Draggable desktop icons (Alt+Drag to move)
(function enableDraggableIcons(){
    const iconsContainer = document.querySelector('.icons');
    if (!iconsContainer) return;

    let draggingIcon = null;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

    function onMove(e){
        if (!draggingIcon) return;
        const rect = iconsContainer.getBoundingClientRect();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const iconRect = draggingIcon.getBoundingClientRect();
        let nextLeft = startLeft + dx;
        let nextTop = startTop + dy;
        nextLeft = clamp(nextLeft, 0, rect.width - iconRect.width);
        nextTop = clamp(nextTop, 0, rect.height - iconRect.height);
        draggingIcon.style.left = `${nextLeft}px`;
        draggingIcon.style.top = `${nextTop}px`;
    }

    function onUp(){
        if (!draggingIcon) return;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        try {
            const key = `icon-pos:${draggingIcon.id}`;
            localStorage.setItem(key, JSON.stringify({ left: draggingIcon.style.left, top: draggingIcon.style.top }));
        } catch(_){}
        draggingIcon = null;
    }

    iconsContainer.addEventListener('mousedown', (e)=>{
        const icon = e.target.closest('.icon');
        if (!icon) return;
        // Hold Alt to drag (prevents interfering with click-to-open)
        if (!e.altKey) return;
        e.preventDefault();
        const containerRect = iconsContainer.getBoundingClientRect();
        const iconRect = icon.getBoundingClientRect();
        // Switch to absolute positioning within container
        icon.style.position = 'absolute';
        if (!icon.style.left) icon.style.left = `${iconRect.left - containerRect.left}px`;
        if (!icon.style.top) icon.style.top = `${iconRect.top - containerRect.top}px`;

        draggingIcon = icon;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseFloat(icon.style.left) || 0;
        startTop = parseFloat(icon.style.top) || 0;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    // Restore saved icon positions
    document.querySelectorAll('.icon').forEach(icon => {
        try {
            const key = `icon-pos:${icon.id}`;
            const saved = localStorage.getItem(key);
            if (saved){
                const pos = JSON.parse(saved);
                icon.style.position = 'absolute';
                if (pos.left) icon.style.left = pos.left;
                if (pos.top) icon.style.top = pos.top;
            }
        } catch(_){}
    });
})();

// Music player wiring: cover, metadata, and playback
(function wireMusicPlayer(){
    const audio = document.getElementById('music-player-audio');
    const coverImg = document.getElementById('music-player-cover');
    const artistEl = document.getElementById('music-player-artist');
    const titleEl = document.getElementById('music-player-title');
    const pauseBtn = document.querySelector('#window--music--player .music--player--pause--control--button');
    const volUpBtn = document.querySelector('#window--music--player .window__music__player__volume__control__buttons .window__control__button:nth-child(1)');
    const volDownBtn = document.querySelector('#window--music--player .window__music__player__volume__control__buttons .window__control__button:nth-child(2)');

    if (!audio || !coverImg || !artistEl || !titleEl || !pauseBtn) return;

    // Configure track
    const track = {
        src: 'Neil Diamond -  - Sweet Caroline.mp3',
        cover: '81JQt4Uv6wL._UF1000,1000_QL80_.jpg',
        artist: 'Neil Diamond',
        title: 'Sweet Caroline'
    };

    coverImg.src = track.cover;
    coverImg.alt = `${track.artist} - ${track.title}`;
    artistEl.textContent = track.artist;
    titleEl.textContent = track.title;

    audio.src = track.src;
    audio.preload = 'metadata';

    let isPlaying = false;

    function togglePlay(){
        if (!isPlaying){
            audio.play().then(()=>{ isPlaying = true; }).catch(()=>{});
        } else {
            audio.pause();
            isPlaying = false;
        }
    }

    pauseBtn.addEventListener('click', function(e){
        e.preventDefault();
        togglePlay();
    });

    audio.addEventListener('ended', ()=>{ isPlaying = false; });

    // Volume controls
    function adjustVolume(delta) {
        const next = Math.min(1, Math.max(0, (audio.volume || 1) + delta));
        audio.volume = next;
    }
    if (volUpBtn) volUpBtn.addEventListener('click', (e)=>{ e.preventDefault(); adjustVolume(+0.1); });
    if (volDownBtn) volDownBtn.addEventListener('click', (e)=>{ e.preventDefault(); adjustVolume(-0.1); });
})();

// Minimize/Maximize controls mapping to CSS-only state
(function wireWindowControls(){
    const container = document.querySelector('.windows');
    if (!container) return;
    container.addEventListener('click', function(e){
        const btn = e.target.closest('.window__control__button');
        if (!btn) return;
        const winEl = btn.closest('.window');
        if (!winEl) return;

        // Maximize toggle
        if (btn.querySelector('.window__control__button__drawing__maximize')) {
            e.preventDefault();
            if (winEl.dataset.maximized === '1') {
                // restore
                const pos = JSON.parse(winEl.dataset.prevPos || '{}');
                if (pos.left) winEl.style.left = pos.left;
                if (pos.top) winEl.style.top = pos.top;
                if (pos.width) winEl.style.width = pos.width;
                if (pos.height) winEl.style.height = pos.height;
                winEl.dataset.maximized = '0';
            } else {
                // save and maximize to container
                const rect = winEl.getBoundingClientRect();
                const c = container.getBoundingClientRect();
                winEl.dataset.prevPos = JSON.stringify({ left: winEl.style.left, top: winEl.style.top, width: winEl.style.width, height: winEl.style.height });
                winEl.style.left = '0px';
                winEl.style.top = '0px';
                winEl.style.width = `${c.width - 2}px`;
                winEl.style.height = `${c.height - 2}px`;
                winEl.dataset.maximized = '1';
            }
        }

        // Minimize: hide via checkbox mapping (set unchecked)
        if (btn.querySelector('.window__control__button__drawing__dash')) {
            e.preventDefault();
            const windowId = winEl.id;
            const checkboxId = windowId.replace('window--', 'icon--') + '--input';
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) checkbox.checked = false;
        }
    });
})();