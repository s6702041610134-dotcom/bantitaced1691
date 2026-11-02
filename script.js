// Enhanced Interactive JavaScript for Feather.computer
document.addEventListener('DOMContentLoaded', () => {
  console.log('Feather website interactive features loaded.');

  // -------------------------------------------------------------
  // 1. 3D Filing Cabinet Drawers Interactivity
  // -------------------------------------------------------------
  const drawers = document.querySelectorAll('.Landing1Drawers_drawer__mC18M');
  const paperStacks = document.querySelectorAll('.Landing1Drawers_paperStack__aTO_R');

  drawers.forEach((drawer, idx) => {
    drawer.style.cursor = 'pointer';
    drawer.addEventListener('click', (e) => {
      e.stopPropagation();

      const isOpen = drawer.classList.contains('drawer-open');

      // Close all drawers
      drawers.forEach(d => {
        d.classList.remove('drawer-open');
        d.style.transform = '';
      });

      // Toggle clicked drawer
      if (!isOpen) {
        drawer.classList.add('drawer-open');
        // Apply 3D translation forward
        drawer.style.transform = 'translateZ(60px) translateY(-10px)';

        // Trigger paper jump if paper stack exists inside
        const stack = drawer.querySelector('.Landing1Drawers_paperStack__aTO_R');
        if (stack) {
          stack.style.animation = 'none';
          stack.offsetHeight; // trigger reflow
          stack.style.animation = 'Landing1Drawers_paperJump__NTAME 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        }
      }
    });
  });

  // Close drawers when clicking outside
  document.addEventListener('click', () => {
    drawers.forEach(d => {
      d.classList.remove('drawer-open');
      d.style.transform = '';
    });
  });

  // -------------------------------------------------------------
  // 2. Data Workspace Room Tabs (Fundraising, Customer, Job App)
  // -------------------------------------------------------------
  const roomTabs = document.querySelectorAll('[class*="Landing1Room_tab"], [class*="Room_tab"]');
  const tableRows = document.querySelectorAll('tr, [class*="TableRow"], [class*="Row"]');

  const sampleDataByRoom = {
    'Fundraising Progress': [
      { title: 'Series A Term Sheet', comp: '$2,500,000', company: 'Sequoia Cap', status: 'Approved' },
      { title: 'Lead Investor Sync', comp: '$1,200,000', company: 'Benchmark', status: 'In Review' },
      { title: 'Angel Syndicate', comp: '$500,000', company: 'Naval & Friends', status: 'Completed' },
      { title: 'SAFEs Execution', comp: '$850,000', company: 'Y Combinator', status: 'Signed' }
    ],
    'Customer Conversation': [
      { title: 'Enterprise SLA Renewal', comp: '$120,000', company: 'Acme Corp', status: 'Negotiating' },
      { title: 'Custom API Tier Request', comp: '$45,000', company: 'Stripe Inc', status: 'Active' },
      { title: 'Feedback Sync Call', comp: '$90,000', company: 'Vercel', status: 'Scheduled' }
    ],
    'Job Application': [
      { title: 'Rcnyjufq Cxitepal', comp: '$949,949', company: 'Zkvgrc WD', status: 'Qbmxitepalw' },
      { title: 'Ufqbmxit Falwhsdo', comp: '$838,838', company: 'Cnyju', status: 'Tepalwh' },
      { title: 'Xitepal Bsdozkvg', comp: '$727,727', company: 'Fqbmx', status: 'Whsdozkv' },
      { title: 'Alwhsdo Evgrcnyj', comp: '$616,616', company: 'Itepa', status: 'Zkvgrcn' }
    ]
  };

  roomTabs.forEach(tab => {
    tab.style.cursor = 'pointer';
    tab.addEventListener('click', () => {
      roomTabs.forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');

      const roomName = tab.textContent.trim();
      console.log('Switched to room:', roomName);

      // Animate table container update
      const tableBody = document.querySelector('tbody');
      if (tableBody && sampleDataByRoom[roomName]) {
        tableBody.style.opacity = '0.3';
        tableBody.style.transition = 'opacity 0.2s ease';

        setTimeout(() => {
          const items = sampleDataByRoom[roomName];
          let rowsHtml = '';
          items.forEach(item => {
            rowsHtml += `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); font-family: var(--font-mono);">
                <td style="padding: 12px 16px; color: #fff;">${item.title}</td>
                <td style="padding: 12px 16px; color: #6ee7b7;">${item.comp}</td>
                <td style="padding: 12px 16px; color: #94a3b8;">${item.company}</td>
                <td style="padding: 12px 16px;"><span style="background: rgba(255,255,255,0.08); padding: 4px 10px; borderRadius: 12px; font-size: 12px;">${item.status}</span></td>
                <td style="padding: 12px 16px; color: #a78bfa; cursor: pointer;">View →</td>
              </tr>
            `;
          });
          tableBody.innerHTML = rowsHtml;
          tableBody.style.opacity = '1';
        }, 150);
      }
    });
  });

  // -------------------------------------------------------------
  // 3. View Switch Tabs (Table, Insight, Sources)
  // -------------------------------------------------------------
  const viewTabs = document.querySelectorAll('[class*="viewTab"], [class*="ViewTab"]');
  viewTabs.forEach(vTab => {
    vTab.style.cursor = 'pointer';
    vTab.addEventListener('click', () => {
      viewTabs.forEach(v => v.style.opacity = '0.5');
      vTab.style.opacity = '1';
    });
  });

  // -------------------------------------------------------------
  // 4. Interactive Stamps ("YES", "NO", "MAYBE")
  // -------------------------------------------------------------
  const stamps = document.querySelectorAll('img[src*="stamp-"]');
  stamps.forEach(stamp => {
    stamp.style.cursor = 'pointer';
    stamp.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    stamp.addEventListener('click', (e) => {
      e.stopPropagation();
      stamp.style.transform = 'scale(0.85) rotate(-12deg)';

      // Create stamp sound effect or visual ripple
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.width = '60px';
      ripple.style.height = '60px';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(239, 68, 68, 0.3)';
      ripple.style.left = `${e.clientX - 30}px`;
      ripple.style.top = `${e.clientY - 30}px`;
      ripple.style.pointerEvents = 'none';
      ripple.style.animation = 'ping 0.5s ease-out forwards';
      document.body.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);
      setTimeout(() => {
        stamp.style.transform = 'scale(1) rotate(0deg)';
      }, 150);
    });
  });

  // Add ping keyframes dynamically
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes ping {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .drawer-open {
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 15px rgba(255,255,255,0.1);
      z-index: 10 !important;
    }
    .active-tab {
      color: #fff !important;
      border-bottom: 2px solid #a78bfa !important;
    }
  `;
  document.head.appendChild(styleTag);

  // -------------------------------------------------------------
  // 5. Interactive Mouse Parallax for Floating Cards
  // -------------------------------------------------------------
  const heroViewport = document.querySelector('.Landing1Hero_viewport___3Rj9');
  const cards = document.querySelectorAll('.Landing1Hero_card__FCEYP');

  if (heroViewport) {
    heroViewport.addEventListener('mousemove', (e) => {
      const rect = heroViewport.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cards.forEach((card, idx) => {
        const depth = (idx % 5 + 1) * 6;
        card.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0px)`;
      });
    });

    heroViewport.addEventListener('mouseleave', () => {
      cards.forEach(card => {
        card.style.transform = 'translate3d(0, 0, 0)';
        card.style.transition = 'transform 0.6s ease';
      });
    });
  }

  // -------------------------------------------------------------
  // 6. Interactive Owl Wings / Eye Cursor Tracking
  // -------------------------------------------------------------
  const owl = document.querySelector('.Landing1Owl_owl__B0AyO');
  if (owl) {
    window.addEventListener('mousemove', (e) => {
      const owlRect = owl.getBoundingClientRect();
      const owlCenterX = owlRect.left + owlRect.width / 2;
      const owlCenterY = owlRect.top + owlRect.height / 2;

      const angleX = (e.clientX - owlCenterX) / window.innerWidth * 15;
      const angleY = (e.clientY - owlCenterY) / window.innerHeight * 15;

      owl.style.transform = `perspective(1000px) rotateY(${angleX}deg) rotateX(${-angleY}deg)`;
      owl.style.transition = 'transform 0.1s ease-out';
    });
  }
});
