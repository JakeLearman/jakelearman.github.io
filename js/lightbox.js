(() => {
    // Opens gallery photos in a full-screen viewer instead of a new tab.
    // The links still point at the full-size images, so without JS (or on
    // ctrl/cmd-click) they behave as plain links.
    const links = [...document.querySelectorAll('.gallery a[href]')];
    if (!links.length || typeof HTMLDialogElement !== 'function') return;

    // The gallery is laid out in columns, so DOM order runs down each column.
    // Step through in roll order (the filenames) instead, which reads left to
    // right across the grid.
    const photos = links
        .map((link) => ({ link, src: link.getAttribute('href'), alt: link.querySelector('img')?.alt || '' }))
        .sort((a, b) => a.src.localeCompare(b.src));

    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = `
        <figure class="lightbox-figure">
            <img class="lightbox-img" alt="">
            <figcaption class="lightbox-caption">
                <span class="lightbox-alt"></span>
                <span class="lightbox-count"></span>
            </figcaption>
        </figure>
        <button type="button" class="lightbox-btn lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous photo">&larr;</button>
        <button type="button" class="lightbox-btn lightbox-next" aria-label="Next photo">&rarr;</button>`;
    document.body.appendChild(box);

    const img = box.querySelector('.lightbox-img');
    const alt = box.querySelector('.lightbox-alt');
    const count = box.querySelector('.lightbox-count');
    let index = 0;

    const show = (i) => {
        index = (i + photos.length) % photos.length;
        const photo = photos[index];
        img.classList.remove('is-loaded');
        img.src = photo.src;
        img.alt = photo.alt;
        alt.textContent = photo.alt;
        count.textContent = `${index + 1} / ${photos.length}`;
        // warm the cache for the neighbours so stepping feels instant
        [index + 1, index - 1].forEach((n) => {
            new Image().src = photos[(n + photos.length) % photos.length].src;
        });
    };

    // keep the caption lined up with the photo's own edges, whatever its shape
    const caption = box.querySelector('.lightbox-caption');
    const fitCaption = () => { caption.style.width = `${img.clientWidth}px`; };
    img.addEventListener('load', () => { img.classList.add('is-loaded'); fitCaption(); });
    window.addEventListener('resize', () => { if (box.open) fitCaption(); });

    const close = () => box.close();
    box.addEventListener('close', () => {
        document.documentElement.classList.remove('lightbox-open');
        photos[index].link.focus({ preventScroll: true });
    });

    photos.forEach((photo, i) => {
        photo.link.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            show(i);
            document.documentElement.classList.add('lightbox-open');
            box.showModal();
        });
    });

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));

    // clicking the dark backdrop (anywhere that isn't the photo or a button) closes
    box.addEventListener('click', (event) => {
        if (event.target === box || event.target.classList.contains('lightbox-figure')) close();
    });

    box.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    });

    // swipe left/right on touch screens
    let startX = null;
    box.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (event) => {
        if (startX === null) return;
        const dx = event.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
})();
