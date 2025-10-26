import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('deskqr-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('deskqr-theme', theme);
  }, [theme]);

  // Map 'dark:...' class tokens to real classes at runtime so the
  // project's hand-authored utilities take effect. We track changes
  // per-element in `dataset.deskqrDark` so switching back to light
  // restores the original classes.
  useEffect(() => {
    const baseOf = (cls) => {
      const last = cls.split(':').pop();
      const parts = last.split('-');
      return parts.slice(0, 2).join('-');
    };

    const enableDark = (el, darkClasses) => {
      const added = [];
      const removed = [];

      darkClasses.forEach((dc) => {
        const target = dc.replace(/^dark:/, '');
        if (!target) return;

        // remove light/conflicting classes that share the same base
        const baseTarget = baseOf(target);
        Array.from(el.classList).forEach((existing) => {
          if (existing.startsWith('dark:') || existing.includes(':')) return;
          if (baseOf(existing) === baseTarget && existing !== target) {
            removed.push(existing);
            el.classList.remove(existing);
          }
        });

        if (!el.classList.contains(target)) {
          el.classList.add(target);
          added.push(target);
        }
      });

      if (added.length || removed.length) {
        try {
          el.dataset.deskqrDark = JSON.stringify({ added, removed });
        } catch (e) {
          // ignore dataset write errors
        }
      }
    };

    const disableDark = (el) => {
      const raw = el.dataset.deskqrDark;
      if (!raw) return;
      let obj = null;
      try {
        obj = JSON.parse(raw);
      } catch (e) {
        // invalid JSON: ignore
        el.removeAttribute('data-deskqr-dark');
        return;
      }

      const { added = [], removed = [] } = obj;
      added.forEach((cls) => el.classList.remove(cls));
      removed.forEach((cls) => {
        if (!el.classList.contains(cls)) el.classList.add(cls);
      });

      delete el.dataset.deskqrDark;
    };

    const apply = (isDark) => {
      const all = Array.from(document.querySelectorAll('*'));
      all.forEach((el) => {
        const classList = Array.from(el.classList || []);
        const darkClasses = classList.filter(c => c.startsWith('dark:'));
        if (darkClasses.length === 0) return;

        if (isDark) {
          enableDark(el, darkClasses);
        } else {
          disableDark(el);
        }
      });
    };

    try {
      apply(theme === 'dark');
    } catch (e) {
      // fallback: rely on the global 'dark' class
      // eslint-disable-next-line no-console
      console.error('apply dark variants failed', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};