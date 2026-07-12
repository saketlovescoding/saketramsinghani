(function () {
    var root = document.documentElement;

    function store(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
    }

    /* ---- Theme ---- */

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        store('theme', theme);
        updateStreakTheme();
        document.dispatchEvent(new CustomEvent('sitetheme', { detail: { theme: theme } }));
    }

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var isDark = root.getAttribute('data-theme') === 'dark';
            setTheme(isDark ? 'light' : 'dark');
        });
    }

    /* Streak image colors must match the active palette (SVG served by a third party) */
    function updateStreakTheme() {
        var img = document.getElementById('streak-img');
        if (!img) return;
        var isDark = root.getAttribute('data-theme') === 'dark';
        var isPersonal = root.getAttribute('data-mode') === 'personal';
        var bg, label, nums;
        if (isDark) {
            bg = isPersonal ? '292724' : '1F2228';
            label = isPersonal ? 'E5E0D8' : 'E2E4E8';
            nums = isPersonal ? '968F86' : '8B9097';
        } else {
            bg = isPersonal ? 'F4EDE4' : 'F4F4F2';
            label = isPersonal ? '1C1917' : '1A1C1F';
            nums = isPersonal ? '78716C' : '6E7278';
        }
        var ring = isDark ? 'D17A4F' : 'B85C38';
        img.src = 'https://github-readme-streak-stats.herokuapp.com/?user=saketlovescoding&hide_border=true' +
            '&background=' + bg + '&ring=' + ring + '&fire=' + ring +
            '&currStreakLabel=' + label + '&sideLabels=' + label + '&currStreakNum=' + label +
            '&sideNums=' + nums + '&dates=' + nums;
    }

    /* ---- Mode (personal / professional) ---- */

    function syncModeButtons() {
        var mode = root.getAttribute('data-mode') || 'professional';
        document.querySelectorAll('[data-mode-btn]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.getAttribute('data-mode-btn') === mode));
        });
    }

    function setMode(mode) {
        if ((root.getAttribute('data-mode') || 'professional') === mode) return;
        root.setAttribute('data-mode', mode);
        store('mode', mode);
        syncModeButtons();
        updateStreakTheme();
        document.dispatchEvent(new CustomEvent('sitemode', { detail: { mode: mode } }));
    }

    document.querySelectorAll('[data-mode-btn]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setMode(btn.getAttribute('data-mode-btn'));
        });
    });

    syncModeButtons();
    updateStreakTheme();

    /* ---- Home page stat strip (quiet numbers) ---- */

    var repoEl = document.getElementById('strip-repos');
    var followerEl = document.getElementById('strip-followers');
    if (repoEl && followerEl) {
        fetch('https://api.github.com/users/saketlovescoding')
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (user) {
                if (!user) return;
                repoEl.textContent = user.public_repos;
                followerEl.textContent = user.followers;
            })
            .catch(function () { /* strip keeps its dashes */ });
    }
})();
