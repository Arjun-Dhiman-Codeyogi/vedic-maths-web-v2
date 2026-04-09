import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

const ThemeToggle = ({ className = '', size = 'md' }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme();
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.88 }}
      className={`${btnSize} rounded-full flex items-center justify-center transition-colors duration-300 ${
        isDark
          ? 'bg-primary/20 text-primary hover:bg-primary/30'
          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Sun className={iconSize} /> : <Moon className={iconSize} />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
