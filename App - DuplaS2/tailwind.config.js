/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                background: '#0A0E17',
                primary: '#10B981', // Emerald
                secondary: '#F59E0B', // Amber
                destructive: '#FB7185', // Rose
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                }
            },
            fontFamily: {
                sans: ['Inter-Regular'],
                medium: ['Inter-Medium'],
                bold: ['Inter-Bold'],
            }
        },
    },
    plugins: [],
}
