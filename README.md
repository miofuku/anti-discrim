# Voice Out - Platform for Immigrant Experiences in Germany

## Project Overview

Voice Out is a web application designed to provide a platform for immigrants in Germany to share their experiences, challenges, and stories. It aims to create awareness about the issues faced by immigrants and foster a supportive community.

## Features

- Multi-language support (English and Chinese)
- Anonymous post creation with categorization
- Viewing and filtering of posts
- Information on support resources for immigrants
- Responsive design for various devices

## Tech Stack

- Backend: Node.js with Express.js
- Database: MongoDB with Mongoose ODM
- Frontend: EJS templates with vanilla JavaScript
- Styling: Custom CSS
- Localization: i18n library


## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/miofuku/anti-discrim.git
   cd anti-discrim
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

5. Generate sample posts (optional):
   ```
   npm run generate-posts
   ```

## Usage

- Visit `http://localhost:3000` in your web browser
- Use the language selector to switch between English and Chinese
- Navigate through different sections using the top menu
- Create a new post on the homepage
- View all posts and apply filters on the "All Stories" page

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For any queries or support, please contact: hello@voiceout.org