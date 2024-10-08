'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import UserInfoLoading from "./Loading/UserInfoLoading";
import { BiBell, BiGroup, BiSolidMegaphone } from "react-icons/bi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdDashboard, MdOutlineDashboard } from "react-icons/md";
import { AiOutlineProfile, AiOutlineUser } from "react-icons/ai";
import { FaUser, FaTachometerAlt, FaSignOutAlt, FaMoon, FaSun, FaBars } from 'react-icons/fa';
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { RiAdminLine, RiLogoutBoxLine } from "react-icons/ri";

export default function Navbar() {
    const t = useTranslations('navbar');
    const tout = useTranslations('swal-logout');
    const pathName = usePathname();
    const router = useRouter();
    const [activeLink, setActiveLink] = useState(pathName);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [image, setImage] = useState('');
    const [isHidden, setIsHidden] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [locationChecked, setLocationChecked] = useState(false);
    const umaxUrl = process.env.NEXT_PUBLIC_API_URL;
    const roles = localStorage.getItem('roles');
    const [lang, setLang] = useState(localStorage.getItem('lang'));

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${umaxUrl}/user-by-id`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
            });
            response.data.Data.forEach(item => {
                setName(item.name);
                setEmail(item.email);
                setRole(item.roles);
                setImage(item.image);
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('locationChecked') && roles === 'client') {
            const fetchLocation = async () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                            const data = await response.json();
                            if (data.address.country_code !== 'id') {
                                setLang('en');
                                router.push(`/en`);
                            } else {
                                setLang('id');
                                router.push(`/id`);
                            }
                            localStorage.setItem('locationChecked', 'true');
                        } catch (error) {
                            console.error('Error fetching location:', error);
                        }
                    }, (error) => {
                        console.error('Error getting geolocation:', error);
                        localStorage.setItem('locationChecked', 'true');
                    });
                } else {
                    console.error('Geolocation not supported');
                    localStorage.setItem('locationChecked', 'true');
                }
            };

            fetchLocation();
        }
    }, [locationChecked, router]);

    useEffect(() => {
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
            localStorage.setItem('color-theme', 'light');
        }
    }, []);

    useEffect(() => {
        fetchUser();
    });

    const handleClick = (link) => {
        setActiveLink(link);
        router.push(`/${lang}${link}`);
    };

    const handleToggle = (e, which) => {
        e.stopPropagation();
        setIsHidden(which);
    };

    const handleLogout = () => {
        Swal.fire({
            title: `${tout('warn')}`,
            text: `${tout('msg')}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `${tout('yes')}`,
            cancelButtonText: `${tout('no')}`,
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                router.push('/');
            }
        });
    };

    const handleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isDark ? 'light' : 'dark');
    };

    const changeLanguage = (lang) => {
        setLang(lang);
        router.push(`/${lang}${activeLink.slice(3)}`);
    };

    const ProfileDropdown = ({ name, email, role, image }) => (
        <div className="relative text-black dark:text-slate-200 hover:cursor-pointer">
            <div className="flex items-center" onClick={isHidden == 1 ? () => setIsHidden(0) : () => setIsHidden(1)}>
                <Image 
                    src={`data:image/png;base64, ${image}`} 
                    alt="Profile" 
                    className="w-11 h-11 rounded-full border-2 me-1 border-gray-300 dark:border-slate-700" 
                    width={44} 
                    height={44} 
                />
                <span className="text-blue-500">
                    {isHidden ? 
                        <IoIosArrowUp size={18} className="font-semibold text-black dark:text-slate-200" /> :
                        <IoIosArrowDown size={18} className="font-semibold text-gray-800 dark:text-slate-200" />
                    }
                </span>
            </div>
            <div className={`profile-dropdown ${isHidden == 1 ? 'block' : 'hidden'} absolute z-10 mt-3 -right-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg w-60 transition-all duration-300 ease-in-out`}>
                <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">{name}</h3>
                    <label htmlFor="theme" className="inline-flex items-center cursor-pointer">
                        {/* Theme toggle */}
                    </label>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{email}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                    <ul className="space-y-4">
                    <li>
                        <Link href={`profile`} className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                            <AiOutlineProfile className="w-5 h-5 mr-2" />
                            Profile
                        </Link>
                    </li>
                    {roles === 'admin'&& (
                        <li>
                            <Link href={`admin-dashboard`} className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                                <RiAdminLine className="w-5 h-5 mr-2" />
                                Admin Dashboard
                            </Link> 
                        </li>
                    )}
                    {/* Other links here */}
                    <li>
                    <button onClick={handleLogout} className="flex items-center text-sm text-red-500 hover:text-red-700">
                        <RiLogoutBoxLine className="w-5 h-5 mr-2" />
                        Logout
                    </button>
                    </li>
                </ul>
            </div>

        </div>
    );

    return (
        <>
            <nav className="fixed top-0 z-50 w-full p-3 bg-white dark:bg-slate-800 shadow-lg px-5">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Image
                        src="/assets/logo.png"
                        alt="Logo"
                        className="w-32 hover:cursor-pointer"
                        width={120}
                        height={48}
                        onClick={() => router.push(`/${lang}/dashboard`)}
                    />
                {/* Menu */}
                <div>
                    <ul className="hidden sm:hidden md:hidden lg:flex xl:flex justify-center p-2 text-black dark:text-slate-100 gap-5">
                        <style jsx>
                            {`
                                .active-link {
                                    background-color: rgba(38, 100, 235);
                                    padding: 9px 16px;
                                    border-radius: 25px;
                                    color: white;
                                    transition: background-color 0.3s, color 0.3s;
                                }
                                ul li {
                                    padding: 9px 16px;
                                    border-radius: 25px;
                                    transition: background-color 0.3s, color 0.3s;
                                }
                                ul li:hover:not(.active-link) {
                                    cursor: pointer;
                                    background-color: rgba(0, 0, 255, 0.1);
                                    color: blue;
                                }
                                .dark ul li:hover:not(.active-link) {
                                    background-color: rgba(255, 255, 255, 0.1);
                                    color: white;
                                }
                            `}
                        </style>
                        <li
                            className={`font-semibold flex gap-1 items-center ${
                                activeLink.slice(3) === "/dashboard" ? "active-link" : ""
                            }`}
                            onClick={() => handleClick("/dashboard")}
                        >
                            <span>
                                <MdDashboard size={20} />
                            </span>
                            {t("dashboard")}
                        </li>
                        <li
                            className={`font-semibold flex gap-1 items-center ${
                                activeLink.slice(3) === "/campaigns" ? "active-link" : ""
                            }`}
                            onClick={() => handleClick("/campaigns")}
                        >
                            <span>
                                <BiSolidMegaphone size={20} />
                            </span>
                            {t("campaign")}
                        </li>
                        <li
                            className={`font-semibold flex gap-1 items-center ${
                                activeLink.slice(3) === "/accounts" ? "active-link" : ""
                            }`}
                            onClick={() => handleClick("/accounts")}
                        >
                            <span>
                                <AiOutlineUser size={20} />
                            </span>
                            {t("account")}
                        </li>
                        {roles !== "client" && (
                            <li
                                className={`font-semibold flex gap-1 items-center ${
                                    activeLink.slice(3) === "/dashboard" ? "active-link" : ""
                                }`}
                                onClick={() => handleClick("/dashboard")}
                            >
                                <span>
                                    <MdDashboard size={20} />
                                </span>
                                {t("dashboard")}
                            </li>
                            <li
                                className={`font-semibold flex gap-1 items-center ${
                                    activeLink.slice(3) === "/campaigns" ? "active-link" : ""
                                }`}
                                onClick={() => handleClick("/campaigns")}
                            >
                                <span>
                                    <BiSolidMegaphone size={20} />
                                </span>
                                {t("campaign")}
                            </li>
                            <li
                                className={`font-semibold flex gap-1 items-center ${
                                    activeLink.slice(3) === "/accounts" ? "active-link" : ""
                                }`}
                                onClick={() => handleClick("/accounts")}
                            >
                                <span>
                                    <AiOutlineUser size={20} />
                                </span>
                                {t("account")}
                            </li>
                        )}
                    </div>
                        </div>
                         {/* Right side */}
                    </div>

                <div className={`${isHidden === 2 ? 'block lg:hidden' : 'hidden'} absolute right-2 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg w-60 transition-all duration-300 ease-in-out`}>
                    <ul className="space-y-1">
                        <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MdOutlineDashboard className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/dashboard`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("dashboard")}</Link>
                        </li>
                        <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <BiSolidMegaphone className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/campaigns`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("campaign")}</Link>
                        </li>
                        <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <AiOutlineUser className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/accounts`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("account")}</Link>
                        </li>
                        <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <BiGroup className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/clients`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("client")}</Link>
                        </li>
                    </ul>
                </div>

                {/* Profile */}
                <div className="flex gap-2 items-center">
                    {roles === 'client' && (
                        activeLink.includes("id") ? 
                            <button onClick={() => changeLanguage('en')} className="text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-full text-sm px-5 py-2.5 me-5">
                                {'ID'}
                            </button>
                        : 
                            <button onClick={() => changeLanguage('id')} className="text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-full text-sm px-5 py-2.5 me-5">
                                {'EN'}
                            </button>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleTheme}
                        className="hidden sm:flex xl:flex items-center justify-center w-10 h-10 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                        {isDark ? <FaSun size={20} className="text-white"/> : <FaMoon size={16} />}
                    </button>
                    <button
                        onClick={isHidden == 2 ? setIsHidden : () => setIsHidden(2)}
                        className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                        <FaBars size={20} className="dark:text-slate-100"/>
                    </button>
                    
                <div className="fixed flex sm:hidden items-center justify-center bg-blue-500 rounded dark:bg-gray-600 z-[99999] shadow-1 dark:shadow-box-dark bottom-10 right-5 h-11 w-11">
                    <label htmlFor="themeSwitcher" className="inline-flex items-center cursor-pointer" aria-label="themeSwitcher" name="themeSwitcher">
                    <input 
                        type="checkbox" 
                        name="themeSwitcher" 
                        checked={isDark} 
                        onChange={handleTheme} 
                        id="themeSwitcher" 
                        className="sr-only" 
                    />
                    <span className="block text-body-color dark:hidden">
                        <FaSun className='text-2xl text-white'/>
                    </span>
                    <span className="hidden text-white dark:block">
                        <FaMoon className='text-xl'/>
                    </span>
                    </label>
                </div>
            </div>

            <div className={`${isHidden === 2 ? 'block lg:hidden' : 'hidden'} absolute right-2 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg w-60 transition-all duration-300 ease-in-out`}>
                <ul className="space-y-1">
                    <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MdOutlineDashboard className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/dashboard`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("dashboard")}</Link>
                    </li>
                    <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <BiSolidMegaphone className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/campaigns`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("campaign")}</Link>
                    </li>
                    <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <AiOutlineUser className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/accounts`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("account")}</Link>
                    </li>
                    <li className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <BiGroup className="w-6 h-6 mr-2 dark:text-white"/>
                        <Link href={`/${lang}/clients`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("client")}</Link>
                    </li>
                </ul>
            </div>

            <div className="fixed flex sm:hidden items-center justify-center bg-blue-500 rounded dark:bg-gray-600 z-[99999] shadow-1 dark:shadow-box-dark bottom-10 right-5 h-11 w-11">
                <label htmlFor="themeSwitcher" className="inline-flex items-center cursor-pointer" aria-label="themeSwitcher" name="themeSwitcher">
                    <input 
                        type="checkbox" 
                        name="themeSwitcher" 
                        checked={isDark} 
                        onChange={handleTheme} 
                        id="themeSwitcher" 
                        className="sr-only" 
                    />
                    <span className="block text-body-color dark:hidden">
                        <FaSun className='text-2xl text-white'/>
                    </span>
                    <span className="hidden text-white dark:block">
                        <FaMoon className='text-xl'/>
                    </span>
                </label>
            </div>
        </nav>
    );
}
