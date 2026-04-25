import { pixelBasedPreset, type TailwindConfig } from "react-email";

export default {
	presets: [pixelBasedPreset],
	theme: {
		extend: {
			colors: {
				"background-muted": "#f6f9fc",
				background: "#ffffff",
				foreground: "#252525",
				card: "#ffffff",
				"card-foreground": "#252525",
				primary: "#343434",
				"primary-foreground": "#fbfbfb",
				secondary: "#9b59b6",
				"secondary-foreground": "#fbfbfb",
				muted: "#c6c6c6",
				"muted-foreground": "#8e8e8e",
				accent: "#c026d3",
				"accent-foreground": "#b89bb8",
				destructive: "#dc2626",
				border: "#ebebeb",
				input: "#ebebeb",
				ring: "#b5b5b5",
			},
			borderRadius: {
				DEFAULT: "10px",
				sm: "6px",
				md: "8px",
				lg: "10px",
				xl: "14px",
			},
			fontFamily: {
				sans: ['"Roboto", ui-sans-serif, system-ui, sans-serif'],
			},
		},
	},
} satisfies TailwindConfig;
