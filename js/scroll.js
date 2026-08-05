(() => {
    // Random photo for the personal-projects panel (runs regardless of motion preference)
    const photoTarget = document.getElementById('personal-photo');
    if (photoTarget) {
        const photos = [
            '000010130001.jpg', '000010130005.jpg', '000010130014.jpg',
            '000010140004.jpg', '000010140005.jpg', '000010140035.jpg',
            '000010150015.jpg', '000010150035.jpg', '000010150036.jpg',
            '000057370005.jpg', '000057370018.jpg', '000057380003.jpg',
            '000057380005.jpg', '000057390002.jpg', '000057390012.jpg',
            '000057390022.jpg', '000057400036.jpg', '000078140001.jpg',
            '000095410020.jpg', '000095410035.jpg', '000095420010.jpg',
            '000095420013.jpg'
        ];
        const pick = photos[Math.floor(Math.random() * photos.length)];
        photoTarget.src = `images/Photos/${pick}`;
    }

    // ?motion=force lets you preview the animation even if your OS/browser
    // has "reduce motion" enabled, without changing that system setting.
    const forceMotion = new URLSearchParams(location.search).has('motion');
    if (forceMotion) document.documentElement.classList.add('force-motion');
    const reduceMotion = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Full-screen intro curtain: like garage-door shutters — closed at the
    // top of the page, opening gradually in direct proportion to how far the
    // user scrolls through the reserved .intro-spacer distance. Fully
    // bidirectional: scrolling back up to the top closes it again, so its
    // colours/state always match the current scroll position rather than
    // vanishing permanently the first time it opens.
    const curtain = document.getElementById('intro-curtain');
    const introSpacer = document.querySelector('.intro-spacer');
    if (curtain && introSpacer) {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        if (reduceMotion) {
            curtain.style.display = 'none';
        } else {
            const bars = curtain.querySelectorAll('.blinds span');
            let ticking = false;

            const update = () => {
                ticking = false;

                const openDistance = introSpacer.offsetHeight;
                const progress = Math.max(0, Math.min(1, window.scrollY / openDistance));

                bars.forEach((bar, i) => {
                    const staggerStart = (i / bars.length) * 0.6;
                    const local = Math.max(0, Math.min(1, (progress - staggerStart) / (1 - staggerStart)));
                    bar.style.transform = `scaleY(${1 - local})`;
                });
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            }, { passive: true });

            update();
        }
    }

    if (reduceMotion) return;

    // Scroll-reveal: fade/slide up elements, grow section bars, open photo blinds.
    // Shutter-dividers are excluded here — they use their own progressive
    // scroll-driven opening below, matching the intro curtain's mechanic.
    const revealEls = document.querySelectorAll('.reveal, .section-bar, .reveal-photo:not(.shutter-divider)');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('is-visible', entry.isIntersecting);
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    }

    // Shutter-dividers between sections: same garage-door mechanic as the
    // intro curtain, but scaled to the divider's own transit through the
    // viewport (bottom edge to top edge) instead of a dedicated spacer —
    // they're short, so there's no room to reserve extra scroll distance.
    const dividers = document.querySelectorAll('.shutter-divider');
    if (dividers.length) {
        let dTicking = false;

        const updateDividers = () => {
            dTicking = false;
            const viewportH = window.innerHeight;

            dividers.forEach((divider) => {
                const bars = divider.querySelectorAll('.blinds span');
                const rect = divider.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / viewportH));

                bars.forEach((bar, i) => {
                    const staggerStart = (i / bars.length) * 0.6;
                    const local = Math.max(0, Math.min(1, (progress - staggerStart) / (1 - staggerStart)));
                    bar.style.transform = `scaleY(${1 - local})`;
                });
            });
        };

        window.addEventListener('scroll', () => {
            if (!dTicking) {
                window.requestAnimationFrame(updateDividers);
                dTicking = true;
            }
        }, { passive: true });

        updateDividers();
    }

    // Parallax columns: each column drifts at a slightly different speed.
    // Anchored to scroll position (not each column's own center relative to
    // the viewport) so the offset is guaranteed to be exactly 0 at the top of
    // the page — these columns are very tall, and the old center-relative
    // calculation produced a large offset immediately on load, before any
    // scrolling, pushing a column up into the header.
    const columns = document.querySelectorAll('.parallax-col');
    if (columns.length && window.innerWidth > 640) {
        const speeds = [0.06, -0.05, 0.07];
        let ticking = false;

        const update = () => {
            columns.forEach((col, i) => {
                const offset = Math.max(-200, Math.min(200, window.scrollY * speeds[i % speeds.length]));
                col.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        update();
    }
})();
