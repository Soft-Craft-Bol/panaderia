import { useState, useEffect } from 'react';

export const useTheme = (initialTheme = 'light') => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || initialTheme;
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark', newTheme === 'dark');
    console.log(`Theme changed to: ${newTheme}`);
  };

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
};
