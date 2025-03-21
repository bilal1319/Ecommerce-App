import React, { useState, useEffect, useRef } from 'react';
import { LogoutBtn } from './LogoutBtn';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [isMobileProductDropdownOpen, setIsMobileProductDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    

    useEffect(() => {
        document.body.style.overflowY = isOpen ? 'hidden' : 'auto';
    }, [isOpen]);

    
    // Fix for closing dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className='w-full min-h-[60px] px-6 py-3 bg-blue-600 text-white flex justify-between items-center relative'>
            <div>
                <h1 className='text-2xl font-semibold'>Ecommerce</h1>
            </div>

            {/* Desktop Menu */}
            <ul className='hidden md:flex gap-8 items-center'>
                <Link to={'/admin-dash'}><li className='text-lg cursor-pointer font-medium hover:border-b-2 border-white'>Dashboard</li></Link>

                    <li className='relative ' ref={dropdownRef}>
                        <button 
                            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                            className='flex items-center text-lg font-medium hover:border-b-2 border-white'>
                            Features <ChevronDown size={18} className='ml-1' />
                        </button>
                        {isProductDropdownOpen && (
                            <ul className='absolute py-2 z-[100] left-0 mt-2 bg-white text-black shadow-lg rounded-md w-40'>
                                <Link to={'/create-product'}><li className='px-4 py-2 hover:bg-gray-200 cursor-pointer'>Add Product</li></Link>
                                <Link to={'/categories'}><li className='px-4 py-2 hover:bg-gray-200 cursor-pointer' onClick={() => setIsOpen(false)}>Categories</li></Link>
                            </ul>
                        )}
                    </li>
                
                
                    
                
                
                <li><LogoutBtn /></li>
            </ul>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className='md:hidden z-[101]'>
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Menu */}
            <div className={`absolute top-0 left-0 w-full h-screen z-[100] bg-blue-600 flex flex-col items-center justify-center gap-6 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <ul className='flex flex-col items-center gap-6 text-xl font-medium'>
                    <Link to={'/home'}><li onClick={() => setIsOpen(false)} className='cursor-pointer hover:border-b-2 border-white'>Home</li></Link>
                    <Link to={'/products'}><li onClick={() => setIsOpen(false)} className='cursor-pointer hover:border-b-2 border-white'>All Products</li></Link>
                   
                        <li>
                            <button
                                onClick={() => setIsMobileProductDropdownOpen(!isMobileProductDropdownOpen)}
                                className='flex items-center cursor-pointer hover:border-b-2 border-white'>
                                Product <ChevronDown size={18} className='ml-1' />
                            </button>
                            {isMobileProductDropdownOpen && (
                                <ul className='mt-2 z-[100] bg-white text-black shadow-lg rounded-md w-40 text-center'>
                                    <Link to={'/create-product'}><li className='px-4 py-2 hover:bg-gray-200 cursor-pointer' onClick={() => setIsOpen(false)}>Add Product</li></Link>
                                    <Link to={'/categories'}><li className='px-4 py-2 hover:bg-gray-200 cursor-pointer' onClick={() => setIsOpen(false)}>Categories</li></Link>
                                </ul>
                            )}
                        </li>

                    <li><LogoutBtn /></li>
                </ul>
            </div>
        </nav>
    );
};
