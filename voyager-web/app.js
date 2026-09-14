// Initial State
const state = {
  currentTab: 'home',
  mapPlaces: [],
  albums: [
    {
      id: 1,
      month: 8, // September (0-indexed)
      year: 2026,
      name: "Bangkok Weekend",
      dateStr: "12–14 September 2026",
      places: ["ICONSIAM", "Wat Arun", "Yaowarat"],
      distance: 12.8,
      memory: "A fantastic short weekend exploring the riverside.",
      photos: ["https://images.unsplash.com/photo-1583417646698-f2b7f75fb192?w=400&q=80", "https://images.unsplash.com/photo-1605335122119-e58f00db1a86?w=400&q=80"]
    }
  ],
  selectedMonth: 8, // Sept
  selectedYear: 2026
};

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const app = {
  navigate(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this.render();
  },

  render() {
    const root = document.getElementById('content-area');
    switch (state.currentTab) {
      case 'home': root.innerHTML = this.views.home(); break;
      case 'feed': root.innerHTML = this.views.feed(); break;
      case 'map': 
        root.innerHTML = this.views.map(); 
        this.initMap();
        break;
      case 'album': 
        root.innerHTML = this.views.album(); 
        this.renderAlbumMonth();
        break;
    }
    root.scrollTop = 0;
  },

  views: {
    home: () => `
      <div class="hero pt-safe">
        <div class="hero-header">
          <div class="logo-text">Voyager</div>
          <img class="avatar" src="https://ui-avatars.com/api/?name=User&background=DCECEF&color=4B2E1F" />
        </div>
        <h1>Your next<br>adventure</h1>
        <p class="lede">Discover places worth remembering.</p>
        <button class="btn btn-primary" onclick="app.navigate('map')">Plan a trip</button>
      </div>
      <div class="pad">
        <div class="hero-illustration">
          <svg viewBox="0 0 340 170" fill="none">
            <path d="M30 150 L30 60 Q30 50 40 50 L60 50 Q70 50 70 60 L70 150 Z" fill="#F6F3EE" stroke="#4B2E1F" stroke-width="1.3"/>
            <path d="M75 150 L75 40 Q75 28 90 28 L120 28 Q135 28 135 40 L135 150 Z" fill="#F6F3EE" stroke="#4B2E1F" stroke-width="1.3"/>
            <rect x="83" y="45" width="10" height="14" stroke="#4B2E1F" stroke-width="1.1" fill="none"/>
            <rect x="100" y="45" width="10" height="14" stroke="#4B2E1F" stroke-width="1.1" fill="none"/>
            <rect x="117" y="45" width="10" height="14" stroke="#4B2E1F" stroke-width="1.1" fill="none"/>
            <path d="M140 150 L140 75 Q140 65 150 65 L165 65 Q175 65 175 75 L175 150 Z" fill="#F4E6A6" stroke="#4B2E1F" stroke-width="1.3"/>
            <circle cx="245" cy="70" r="30" fill="none" stroke="#4B2E1F" stroke-width="1.2" stroke-dasharray="2 4"/>
            <path d="M215 150 Q220 90 245 90 Q270 90 275 150" fill="none" stroke="#4B2E1F" stroke-width="1.4"/>
            <path d="M245 90 L245 45" stroke="#4B2E1F" stroke-width="1.4"/>
            <ellipse cx="245" cy="40" rx="9" ry="6" fill="#F4E6A6" stroke="#4B2E1F" stroke-width="1.1"/>
            <line x1="10" y1="150" x2="330" y2="150" stroke="#4B2E1F" stroke-width="1.2"/>
          </svg>
        </div>
      </div>
    `,
    feed: () => `<div class="pad pt-safe pb-safe"><h2 class="section-title">Travel Stories</h2><p>Coming soon...</p></div>`,
    map: () => `
      <div class="map-view">
        <div class="map-ui-top pt-safe">
          <div class="search-bar" onclick="app.addRandomPlace()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <span>+ Tap here to add a place</span>
          </div>
        </div>
        
        <div class="map-canvas" id="svg-map" onclick="app.mapClicked(event)">
          <svg class="map-svg" viewBox="0 0 390 500" preserveAspectRatio="xMidYMid slice">
            <path d="M -50 100 Q 150 50 200 250 T 450 300" fill="none" stroke="#DCECEF" stroke-width="80" stroke-linecap="round"/>
            <path d="M 100 -50 Q 150 200 50 400" fill="none" stroke="#F4E6A6" stroke-width="12" stroke-linecap="round"/>
            <path d="M 100 -50 Q 150 200 50 400" fill="none" stroke="#4B2E1F" stroke-width="1.5" stroke-dasharray="2 8"/>
            <path id="route-path" class="map-route-line" />
            <g id="pins-layer"></g>
          </svg>
        </div>

        <div class="map-panel-bottom" id="map-panel">
          <div class="panel-handle"></div>
          <div class="panel-header">
            <div class="panel-stats">
              <div class="val" id="stat-dist">0.0 km</div>
              <div class="lbl">Total Distance</div>
            </div>
            <div class="panel-stats" style="text-align:right;">
              <div class="val" id="stat-places">0</div>
              <div class="lbl">Places Visited</div>
            </div>
          </div>
          <div class="timeline-list" id="timeline-list">
            <!-- Timeline items injected here -->
          </div>
          <div class="finish-btn-wrap">
            <button class="btn btn-primary btn-block" onclick="app.finishTrip()">✓ Finish Journey</button>
          </div>
        </div>
      </div>
    `,
    album: () => `
      <div class="album-view pt-safe pb-safe">
        <div class="album-header">
          <h1>My Travel Album</h1>
          <p>Every trip tells a story.</p>
        </div>
        
        <div class="month-nav" id="month-nav">
          ${monthNames.map((m, i) => `<div class="month-tab ${i === state.selectedMonth ? 'active' : ''}" onclick="app.selectMonth(${i})">${m}</div>`).join('')}
        </div>

        <div class="album-stats" id="album-stats"></div>
        <div class="album-content" id="album-content"></div>
      </div>
    `
  },

  // Map Logic
  initMap() {
    this.renderMapState();
  },
  
  mapClicked(e) {
    // Only add pin if clicking directly on canvas, not UI
    if(e.target.tagName !== 'svg' && e.target.tagName !== 'path') return;
    const rect = document.getElementById('svg-map').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    state.mapPlaces.push({
      id: Date.now(),
      name: \`Place \${state.mapPlaces.length + 1}\`,
      x, y
    });
    this.renderMapState();
  },

  addRandomPlace() {
    const x = 50 + Math.random() * 250;
    const y = 100 + Math.random() * 250;
    state.mapPlaces.push({
      id: Date.now(),
      name: \`Saved Location \${state.mapPlaces.length + 1}\`,
      x, y
    });
    this.renderMapState();
  },

  removePlace(id) {
    state.mapPlaces = state.mapPlaces.filter(p => p.id !== id);
    this.renderMapState();
  },

  renderMapState() {
    const pinsLayer = document.getElementById('pins-layer');
    const routePath = document.getElementById('route-path');
    const timeline = document.getElementById('timeline-list');
    const statDist = document.getElementById('stat-dist');
    const statPlaces = document.getElementById('stat-places');
    
    if(!pinsLayer) return;

    let dString = "";
    let distance = 0;
    let pinsHTML = "";
    let tlHTML = "";

    state.mapPlaces.forEach((p, i) => {
      // SVG Route
      if(i === 0) dString += \`M \${p.x} \${p.y} \`;
      else {
        dString += \`L \${p.x} \${p.y} \`;
        const prev = state.mapPlaces[i-1];
        distance += Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2)) * 0.05; // mock scale
      }

      // SVG Pin
      pinsHTML += \`
        <g class="map-pin" transform="translate(\${p.x}, \${p.y})">
          <path d="M0 -24 C-8 -24 -14 -18 -14 -10 C-14 -2 -2 -2 0 0 C2 -2 14 -2 14 -10 C14 -18 8 -24 0 -24 Z" fill="#4B2E1F" />
          <circle cx="0" cy="-14" r="4" fill="#F4E6A6" />
          <text x="0" y="-32" font-family="Inter" font-size="10" font-weight="bold" fill="#4B2E1F" text-anchor="middle">\${(i+1).toString().padStart(2, '0')}</text>
        </g>
      \`;

      // Timeline Item
      tlHTML += \`
        <div class="tl-item">
          <div class="tl-num">\${(i+1).toString().padStart(2, '0')}</div>
          <div class="tl-content">
            <div>
              <div class="tl-name">📍 \${p.name}</div>
              <div class="tl-dist">Added just now</div>
            </div>
            <button class="tl-remove" onclick="app.removePlace(\${p.id})">✕</button>
          </div>
        </div>
      \`;
    });

    routePath.setAttribute('d', dString);
    pinsLayer.innerHTML = pinsHTML;
    timeline.innerHTML = tlHTML || '<div style="text-align:center; padding:20px; color:#999; font-size:14px;">Tap the map or search to add places.</div>';
    
    statDist.textContent = \`\${distance.toFixed(1)} km\`;
    statPlaces.textContent = state.mapPlaces.length;
  },

  // Receipt Generation
  finishTrip() {
    if(state.mapPlaces.length === 0) {
      alert("Please add some places to your trip first!");
      return;
    }

    const modalHTML = \`
      <div class="receipt-modal show" id="receipt-modal">
        <div class="printer-slot"></div>
        <div class="receipt-paper" id="receipt-paper">
          <div class="r-head">
            <div class="r-title">TRAVEL RECEIPT</div>
            <div class="r-meta">\${new Date().toLocaleDateString()} • \${new Date().toLocaleTimeString()} • TRP-0\${Math.floor(Math.random()*1000)}</div>
          </div>
          <div class="r-body">
            \${state.mapPlaces.map((p, i) => \`
              <div class="r-row"><span>\${i+1}. \${p.name}</span></div>
            \`).join('')}
            <div class="r-mini-map">
              \${document.getElementById('svg-map').innerHTML}
            </div>
            <div class="r-row" style="margin-top:20px; font-weight:bold;"><span>TOTAL DISTANCE</span><span>\${document.getElementById('stat-dist').textContent}</span></div>
            <div class="r-row" style="font-weight:bold;"><span>PLACES VISITED</span><span>\${state.mapPlaces.length}</span></div>
          </div>
          <div class="r-foot">
            TRIP COMPLETED ✓<br><br>
            "Every journey becomes a memory."
          </div>
        </div>
        <div class="receipt-actions">
          <button class="btn btn-secondary" onclick="app.closeReceipt()">Close</button>
          <button class="btn btn-primary" onclick="app.printReceipt()">🖨 Print</button>
        </div>
      </div>
    \`;

    document.getElementById('modal-container').innerHTML = modalHTML;
    
    // Trigger animation
    setTimeout(() => {
      document.getElementById('receipt-paper').classList.add('print-anim');
    }, 100);
  },

  closeReceipt() {
    document.getElementById('modal-container').innerHTML = "";
  },

  printReceipt() {
    const printArea = document.getElementById('print-area');
    const paperHtml = document.getElementById('receipt-paper').outerHTML;
    printArea.innerHTML = paperHtml;
    window.print();
    printArea.innerHTML = "";
  },

  // Album Logic
  selectMonth(index) {
    const oldContainer = document.querySelector('.month-container.active');
    const isNext = index > state.selectedMonth;
    state.selectedMonth = index;
    
    document.querySelectorAll('.month-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    const newContainer = document.createElement('div');
    newContainer.className = \`month-container \${isNext ? 'slide-right' : 'slide-left'}\`;
    newContainer.innerHTML = this.generateMonthContent();
    
    document.getElementById('album-content').appendChild(newContainer);
    
    // Animate
    setTimeout(() => {
      if(oldContainer) {
        oldContainer.classList.remove('active');
        oldContainer.classList.add(isNext ? 'slide-left' : 'slide-right');
        setTimeout(() => oldContainer.remove(), 400);
      }
      newContainer.classList.remove('slide-right', 'slide-left');
      newContainer.classList.add('active');
    }, 50);

    this.updateAlbumStats();
  },

  renderAlbumMonth() {
    document.getElementById('album-content').innerHTML = \`
      <div class="month-container active">
        \${this.generateMonthContent()}
      </div>
    \`;
    
    // Scroll month nav to center active
    const nav = document.getElementById('month-nav');
    const activeTab = nav.querySelector('.active');
    if(activeTab) {
      nav.scrollLeft = activeTab.offsetLeft - (nav.offsetWidth / 2) + (activeTab.offsetWidth / 2);
    }

    this.updateAlbumStats();
  },

  generateMonthContent() {
    const monthTrips = state.albums.filter(a => a.month === state.selectedMonth && a.year === state.selectedYear);
    
    if(monthTrips.length === 0) {
      return \`
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>
          <h3>No Trips Yet</h3>
          <p>Your next adventure is waiting to be written.</p>
          <button class="btn btn-secondary" onclick="app.openCreateModal()">+ Add Your First Trip</button>
        </div>
      \`;
    }

    return monthTrips.map(trip => \`
      <div class="trip-card">
        <div class="trip-head">
          <div>
            <div class="trip-title">\${trip.name}</div>
            <div class="trip-date">\${trip.dateStr}</div>
          </div>
          <div class="trip-badge">\${trip.places.length} Places</div>
        </div>
        
        <div class="photo-carousel">
          \${trip.photos.map(url => \`
            <div class="photo-item"><img src="\${url}" alt="trip photo"></div>
          \`).join('')}
        </div>
        
        <div class="trip-places">
          \${trip.places.map(p => \`<span>📍 \${p}</span>\`).join('')}
        </div>
      </div>
    \`).join('');
  },

  updateAlbumStats() {
    const monthTrips = state.albums.filter(a => a.month === state.selectedMonth && a.year === state.selectedYear);
    let places = 0;
    let distance = 0;
    monthTrips.forEach(t => {
      places += t.places.length;
      distance += t.distance;
    });

    document.getElementById('album-stats').innerHTML = \`
      <div class="stat-box"><b>\${monthTrips.length}</b><span>Trips</span></div>
      <div class="stat-box"><b>\${places}</b><span>Places</span></div>
      <div class="stat-box"><b>\${distance.toFixed(1)} km</b><span>Dist</span></div>
    \`;
  },

  // Global Create Modal
  openCreateModal() {
    const html = \`
      <div class="bottom-sheet-overlay show" id="create-modal" onclick="if(event.target.id==='create-modal') app.closeCreateModal()">
        <div class="bottom-sheet">
          <div class="bs-handle"></div>
          <h2 class="section-title">Record a Journey</h2>
          
          <div class="form-group">
            <label class="form-label">Trip Name</label>
            <input type="text" class="form-input" id="inp-name" placeholder="e.g. Kyoto Autumn">
          </div>
          <div class="form-group">
            <label class="form-label">Places Visited (Comma separated)</label>
            <input type="text" class="form-input" id="inp-places" placeholder="Fushimi Inari, Arashiyama...">
          </div>
          <div class="form-group">
            <label class="form-label">Memory</label>
            <textarea class="form-textarea" id="inp-mem" placeholder="How was it?"></textarea>
          </div>
          
          <button class="btn btn-primary btn-block" onclick="app.saveTrip()">Save to Album</button>
        </div>
      </div>
    \`;
    document.getElementById('modal-container').innerHTML = html;
  },

  closeCreateModal() {
    document.getElementById('modal-container').innerHTML = "";
  },

  saveTrip() {
    const name = document.getElementById('inp-name').value || "New Trip";
    const places = document.getElementById('inp-places').value.split(',').map(s=>s.trim()).filter(s=>s);
    
    state.albums.push({
      id: Date.now(),
      month: state.selectedMonth,
      year: state.selectedYear,
      name: name,
      dateStr: new Date().toLocaleDateString(),
      places: places.length > 0 ? places : ["Unknown Location"],
      distance: Math.random() * 50,
      memory: document.getElementById('inp-mem').value,
      photos: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80"]
    });
    
    this.closeCreateModal();
    if(state.currentTab !== 'album') {
      this.navigate('album');
    } else {
      this.renderAlbumMonth();
    }
  }
};

// Start
app.navigate('home');
