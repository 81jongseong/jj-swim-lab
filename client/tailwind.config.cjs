/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1280px'
  		}
  	},
  	extend: {
  		colors: {
  			primary: {
  				'50': 'hsl(205 80% 95%)',
  				'100': 'hsl(205 80% 90%)',
  				'200': 'hsl(205 80% 80%)',
  				'300': 'hsl(205 80% 70%)',
  				'400': 'hsl(205 80% 60%)',
  				'500': 'hsl(205 80% 50%)',
  				'600': 'hsl(205 80% 40%)',
  				'700': 'hsl(205 80% 30%)',
  				'800': 'hsl(205 80% 22%)',
  				'900': 'hsl(205 80% 15%)',
  				'950': 'hsl(205 80% 10%)',
  				// Tailwind가 사용하는 --primary CSS 변수 (HSL 형식)
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': 'hsl(174 70% 95%)',
  				'100': 'hsl(174 70% 90%)',
  				'200': 'hsl(174 70% 80%)',
  				'300': 'hsl(174 70% 70%)',
  				'400': 'hsl(174 70% 60%)',
  				'500': 'hsl(174 70% 45%)',
  				'600': 'hsl(174 70% 40%)',
  				'700': 'hsl(174 70% 30%)',
  				'800': 'hsl(174 70% 25%)',
  				'900': 'hsl(174 70% 20%)',
  				'950': 'hsl(174 70% 15%)',
  				// Tailwind가 사용하는 --secondary CSS 변수 (HSL 형식)
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': 'hsl(14 85% 95%)',
  				'100': 'hsl(14 85% 90%)',
  				'200': 'hsl(14 85% 80%)',
  				'300': 'hsl(14 85% 70%)',
  				'400': 'hsl(14 85% 60%)',
  				'500': 'hsl(14 85% 55%)',
  				'600': 'hsl(14 85% 50%)',
  				'700': 'hsl(14 85% 40%)',
  				'800': 'hsl(14 85% 30%)',
  				'900': 'hsl(14 85% 25%)',
  				'950': 'hsl(14 85% 20%)',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			info: {
  				'50': 'hsl(195 80% 95%)',
  				'100': 'hsl(195 80% 90%)',
  				'200': 'hsl(195 80% 80%)',
  				'300': 'hsl(195 80% 70%)',
  				'400': 'hsl(195 80% 60%)',
  				'500': 'hsl(195 80% 45%)',
  				'600': 'hsl(195 80% 40%)',
  				'700': 'hsl(195 80% 30%)',
  				'800': 'hsl(195 80% 25%)',
  				'900': 'hsl(195 80% 20%)',
  				'950': 'hsl(195 80% 15%)',
  				DEFAULT: 'hsl(195 80% 45%)',
  				foreground: 'hsl(0 0% 100%)'
  			},
  			success: {
  				'50': 'hsl(150 55% 95%)',
  				'100': 'hsl(150 55% 90%)',
  				'200': 'hsl(150 55% 80%)',
  				'300': 'hsl(150 55% 70%)',
  				'400': 'hsl(150 55% 60%)',
  				'500': 'hsl(150 55% 40%)',
  				'600': 'hsl(150 55% 35%)',
  				'700': 'hsl(150 55% 30%)',
  				'800': 'hsl(150 55% 25%)',
  				'900': 'hsl(150 55% 20%)',
  				'950': 'hsl(150 55% 15%)',
  				DEFAULT: 'hsl(150 55% 40%)',
  				foreground: 'hsl(0 0% 100%)'
  			},
  			warning: {
  				'50': 'hsl(45 95% 95%)',
  				'100': 'hsl(45 95% 90%)',
  				'200': 'hsl(45 95% 80%)',
  				'300': 'hsl(45 95% 70%)',
  				'400': 'hsl(45 95% 60%)',
  				'500': 'hsl(45 95% 55%)',
  				'600': 'hsl(45 95% 50%)',
  				'700': 'hsl(45 95% 40%)',
  				'800': 'hsl(45 95% 30%)',
  				'900': 'hsl(45 95% 25%)',
  				'950': 'hsl(45 95% 20%)',
  				DEFAULT: 'hsl(45 95% 55%)',
  				foreground: 'hsl(205 70% 12%)'
  			},
  			destructive: {
  				'50': 'hsl(355 80% 95%)',
  				'100': 'hsl(355 80% 90%)',
  				'200': 'hsl(355 80% 80%)',
  				'300': 'hsl(355 80% 70%)',
  				'400': 'hsl(355 80% 60%)',
  				'500': 'hsl(355 80% 50%)',
  				'600': 'hsl(355 80% 45%)',
  				'700': 'hsl(355 80% 35%)',
  				'800': 'hsl(355 80% 30%)',
  				'900': 'hsl(355 80% 25%)',
  				'950': 'hsl(355 80% 20%)',
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			'ocean-gradient': {
  				DEFAULT: 'linear-gradient(135deg, hsl(205 80% 22%) 0%, hsl(195 80% 45%) 50%, hsl(174 70% 45%) 100%)',
  				light: 'linear-gradient(135deg, hsl(205 80% 30%) 0%, hsl(195 80% 55%) 50%, hsl(174 70% 55%) 100%)',
  				dark: 'linear-gradient(135deg, hsl(205 80% 15%) 0%, hsl(195 80% 35%) 50%, hsl(174 70% 35%) 100%)'
  			},
  			'wave-gradient': {
  				DEFAULT: 'linear-gradient(90deg, hsl(174 70% 45%) 0%, hsl(195 80% 45%) 50%, hsl(205 80% 22%) 100%)',
  				light: 'linear-gradient(90deg, hsl(174 70% 55%) 0%, hsl(195 80% 55%) 50%, hsl(205 80% 30%) 100%)',
  				dark: 'linear-gradient(90deg, hsl(174 70% 35%) 0%, hsl(195 80% 35%) 50%, hsl(205 80% 15%) 100%)'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  			'144': '36rem'
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			'4xl': '3rem',
  			'5xl': '4rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		gridTemplateColumns: {
  			'13': 'repeat(13, minmax(0, 1fr))',
  			'14': 'repeat(14, minmax(0, 1fr))',
  			'15': 'repeat(15, minmax(0, 1fr))',
  			'16': 'repeat(16, minmax(0, 1fr))'
  		},
  		animation: {
  			wave: 'wave 3s ease-in-out infinite',
  			float: 'float 6s ease-in-out infinite',
  			swim: 'swim 4s ease-in-out infinite',
  			ripple: 'ripple 2s ease-out infinite',
  			particle: 'particle 8s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			wave: {
  				'0%, 100%': {
  					transform: 'translateY(0) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-10px) rotate(2deg)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			swim: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			ripple: {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(4)',
  					opacity: '0'
  				}
  			},
  			particle: {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(-100vh) rotate(360deg)',
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		boxShadow: {
  			water: '0 4px 20px -2px rgba(30, 144, 255, 0.1)',
  			ocean: '0 8px 32px -4px rgba(30, 144, 255, 0.15)',
  			wave: '0 12px 40px -6px rgba(30, 144, 255, 0.2)',
  			deep: '0 16px 48px -8px rgba(30, 144, 255, 0.25)'
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'8xl': [
  				'6rem',
  				{
  					lineHeight: '1.55'
  				}
  			],
  			'9xl': [
  				'8rem',
  				{
  					lineHeight: '1.55'
  				}
  			]
  		},
  		zIndex: {
  			wave: '10',
  			particle: '20',
  			floating: '30',
  			modal: '50',
  			tooltip: '60',
  			toast: '70'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
