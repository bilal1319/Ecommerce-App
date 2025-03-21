import React, { useState, useEffect, useRef } from 'react';
import { LogoutBtn } from './LogoutBtn';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    useEffect(() => {
        document.body.style.overflowY = isOpen ? 'hidden' : 'auto';
    }, [isOpen]);
    
    // Fix for closing dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                console.log("Clicked outside, closing dropdown");
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div>
            <nav className='w-full z-[10000] fixed top-0 min-h-[60px] px-6 py-3 bg-gray-800 border-b border-gray-700 text-white flex justify-between items-center shadow-lg'>
                <div>
                    <h1 className='text-2xl font-semibold text-purple-400'>Ecommerce</h1>
                </div>

                {/* Desktop Menu */}
                <ul className='hidden md:flex gap-8 items-center'>
                    <Link to={'/home'}>
                        <li className='text-lg cursor-pointer font-medium hover:text-purple-400 transition-colors'>Home</li>
                    </Link>
                    <Link to={'/products'}>
                        <li className='text-lg cursor-pointer font-medium hover:text-purple-400 transition-colors'>All Products</li>
                    </Link>
                    
                    <Link to={'/orders'}>
                        <li className='text-lg cursor-pointer font-medium hover:text-purple-400 transition-colors'>Orders</li>
                    </Link>
                   
                    
                    <Link to={'/cart'}>
                        <li className='cursor-pointer hover:text-purple-400 transition-colors'>
                            <ShoppingCart className="text-white hover:text-purple-400" />
                        </li>
                    </Link>
                    
                    <li><LogoutBtn /></li>
                </ul>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className='md:hidden z-[101] text-white hover:text-purple-400'>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Menu */}
                <div className={`absolute top-0 left-0 w-full h-screen z-[100] bg-gray-900 flex flex-col items-center justify-center gap-6 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                    <ul className='flex flex-col items-center gap-8 text-xl font-medium'>
                        <Link to={'/home'}>
                            <li onClick={() => setIsOpen(false)} className='cursor-pointer hover:text-purple-400 transition-colors'>Home</li>
                        </Link>

                        <Link to={'/products'}>
                            <li onClick={() => setIsOpen(false)} className='cursor-pointer hover:text-purple-400 transition-colors'>All Products</li>
                        </Link>
                        
                        <Link to={'/orders'}>
                            <li onClick={() => setIsOpen(false)} className='cursor-pointer hover:text-purple-400 transition-colors'>Orders</li>
                        </Link>

                        <Link to={'/cart'}>
                            <li onClick={() => setIsOpen(false)} className='cursor-pointer hover:text-purple-400 transition-colors'>
                                <ShoppingCart size={24} />
                            </li>
                        </Link>
                        
                        <li><LogoutBtn /></li>
                    </ul>
                </div>
            </nav>
            <div className='pb-[100px]'></div>
        </div>
    );
};