# CounterWind - Platform for Immigrant Experiences in Germany

## Project Overview

CounterWind is a web application designed to provide a platform for immigrants in Germany to share their experiences, challenges, and stories. It aims to create awareness about the issues faced by immigrants and foster a supportive community.

## Features

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

## Usage

- Visit `http://localhost:3000` in your web browser
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

## Deployment Guide

1. Database Setup
- Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster
- Create a database user in "Database Access"
- Add IP access permissions in "Network Access"
- Get the connection string

2. Render.com Deployment
- Connect your GitHub repository
- Create a new Web Service
- Set environment variables:
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `NODE_ENV`: production
  - Other necessary environment variables

3. Local Development
- Copy `.env.example` to `.env`
- Fill in your local environment variables
- Run `npm install`
- Run `npm start`

## Security Configuration

This project uses environment variables for sensitive information. Never commit actual secrets to the repository.

### Required Environment Variables
- `NODE_ENV`: Set to 'production' in production environment
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port number

### Local Development
1. Copy `.env.example` to `.env`
2. Fill in your local development values
3. Never commit `.env` file

### Production Deployment
All sensitive information should be set as environment variables in your deployment platform (e.g., Render.com).