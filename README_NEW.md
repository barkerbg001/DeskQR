# DeskQR

A modern desktop QR code generator and scanner built with Electron, React, and Tailwind CSS.

## Features

- **QR Code Generation**: Create QR codes from text, URLs, phone numbers, emails, and WiFi credentials
- **QR Code Scanning**: Scan QR codes using your webcam or by uploading images
- **History Management**: Keep track of all generated and scanned QR codes
- **Modern UI**: Clean, responsive interface with light/dark theme support
- **Export Options**: Save QR codes as PNG, JPG, or SVG files
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Customization**: Adjustable QR code size, colors, and error correction levels

## Technology Stack

- **Electron**: Desktop application framework
- **React**: User interface library
- **Tailwind CSS**: Utility-first CSS framework
- **QRCode.js**: QR code generation library
- **html5-qrcode**: QR code scanning library
- **Webpack**: Module bundler

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/deskqr.git
   cd deskqr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Package for your platform:
   ```bash
   npm run package
   ```

3. Create installers for all platforms:
   ```bash
   npm run make
   ```

## Project Structure

```
deskqr/
├── public/
│   └── main.js                 # Electron main process
├── src/
│   ├── components/             # React components
│   │   ├── App.js             # Main application component
│   │   ├── Dashboard.js       # Dashboard view
│   │   ├── QRGenerator.js     # QR code generation
│   │   ├── QRScanner.js       # QR code scanning
│   │   ├── History.js         # History management
│   │   └── Settings.js        # Application settings
│   ├── hooks/                 # Custom React hooks
│   │   └── useTheme.js        # Theme management
│   ├── utils/                 # Utility functions
│   │   └── storage.js         # Local storage utilities
│   ├── styles.css             # Global styles
│   └── index.js               # Application entry point
├── webpack.config.js          # Webpack configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Project dependencies and scripts
```

## Features in Detail

### QR Code Generation
- Support for multiple data types (text, URL, phone, email, WiFi)
- Customizable size, colors, and error correction levels
- Real-time preview
- Export in multiple formats

### QR Code Scanning
- Camera-based scanning with live preview
- Image upload support
- Automatic content detection and action suggestions
- Copy to clipboard functionality

### History Management
- Automatic saving of generated and scanned QR codes
- Search and filter capabilities
- Bulk operations (delete, export)
- Persistent storage

### Theming
- Light and dark mode support
- Persistent theme preference
- Smooth transitions between themes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) for QR code generation
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for QR code scanning
- [React Icons](https://react-icons.github.io/react-icons/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework