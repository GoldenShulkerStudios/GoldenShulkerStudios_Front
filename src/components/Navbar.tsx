import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Inicio', href: '#inicio' },
        { name: 'Proyectos', href: '#proyectos' },
        { name: 'Nosotros', href: '#nosotros' },
        { name: 'Contacto', href: '#contacto' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 glass border-b' : 'py-6 bg-transparent'}`}
            style={{ borderBottomColor: scrolled ? 'var(--glass-border)' : 'transparent' }}>
            <div className="container flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <img src="/logo.png" alt="Golden Shulker Studios" className="h-10 w-10 object-contain rounded-lg" />
                    <span className="text-xl font-bold tracking-tight font-heading">
                        GOLDEN <span className="text-[var(--primary)]">SHULKER</span>
                    </span>
                </motion.div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link, index) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                        >
                            {link.name}
                        </motion.a>
                    ))}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 py-2 rounded-full bg-[var(--primary)] text-black font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Únete al Discord
                    </motion.button>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden glass mt-4 mx-4 p-6 rounded-2xl flex flex-col gap-4 border border-[var(--glass-border)]"
                >
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-medium">
                            {link.name}
                        </a>
                    ))}
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
