import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useContext, useState } from 'react';

import { ThemeContext } from "../context/Context";



export default function ToggleDarkMode( {bg} ) {
    
    const {themeApp, setThemeApp} = useContext(ThemeContext)

    const isChecked = themeApp === 'dark'

    const handleToggle = (e) => {
        if (e.target.checked) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme','dark')
            setThemeApp('dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme','light')
            setThemeApp('light')
        }
      }

      return (
        <div className="relative">
            <label className="absolute inline-flex items-center cursor-pointer end-0">
                <input type="checkbox"
                    onChange={handleToggle}
                    checked={isChecked}
                    className="sr-only peer"
                />
                <div className={"w-9 h-5 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-700 dark:bg-gray-700 dark:border-gray-600 bg-gray-600 peer-checked:bg-blue-900 "+bg}>
                </div>
                <span className="w-4 h-4 rounded-full peer-checked:translate-x-full peer-checked:border-white absolute top-[2px] left-[2px] bg-white border-gray-300 border transition-all justify-center flex items-center">
                    {isChecked ? 
                    <MoonIcon className="h-3 w-3 text-neutral-700"/>
                    :
                    <SunIcon className="h-3 w-3 text-yellow-500"/>
                    }
                </span>
            </label>
        </div>
    )
}


