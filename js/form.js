(() => {
    // Sends the contact form in the background and confirms inline, so visitors
    // never leave the site. If Formspree refuses a background send (403 — which
    // is what it does while reCAPTCHA is enabled on the form), fall back to a
    // normal form post so submissions always work either way.
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    const button = form.querySelector('button[type="submit"]');
    const EMAIL = 'jakelearmanproduction@gmail.com';

    const setStatus = (html, kind) => {
        status.innerHTML = html;
        status.className = 'form-status' + (kind ? ` is-${kind}` : '');
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        button.disabled = true;
        setStatus('Sending…');

        let res;
        try {
            res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
        } catch (err) {
            button.disabled = false;
            setStatus(`Couldn't send that – please email <a href="mailto:${EMAIL}" class="project-link">${EMAIL}</a>.`, 'error');
            return;
        }

        if (res.status === 403) {
            form.submit();
            return;
        }

        button.disabled = false;
        if (res.ok) {
            form.reset();
            setStatus("Thanks – message sent. I'll get back to you soon.", 'success');
        } else {
            setStatus(`Something went wrong – please email <a href="mailto:${EMAIL}" class="project-link">${EMAIL}</a>.`, 'error');
        }
    });
})();
