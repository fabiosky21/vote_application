/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily:{
        rubik: ['Rubik', 'sans-serif'],
        "rubik-extrabold": ['Rubik-ExtraBold', 'sans-serif'],
        "rubik-bold": ['Rubik-Bold', 'sans-serif'],
        "rubik-medium": ['Rubik-Medium', 'sans-serif'],
        "rubik-regular": ['Rubik-Regular', 'sans-serif'],
        "rubik-light": ['Rubik-Light', 'sans-serif'],

      },
      colors: {
        "primary": "#FFC107",
        "secondary": "#FFA000",
        "dark": "#212121",
        "light": "#F5F5F5",
        "light-gray": "#E0E0E0",
        "gray": "#9E9E9E",
        "dark-gray": "#424242",
        "white": "#FFFFFF",
        "black": "#000000",
        "error": "#D32F2F",
        "success": "#4CAF50",
        "warning": "#FFA000",
        "info": "#2196F3",
        danger: "#f75555"
      },
      
    },
  },
  plugins: [],
}