# Natours
This project showcases the use of modern web development practices, including server-side rendering, RESTful APIs, and secure authentication. 
Natours is a tour booking application that allows users to browse and book tours around the world. It features user authentication, payment integration, security features. The project is designed to be a comprehensive showcase of backend development skills, covering everything from database management to back-end design.
## Installation

```python
git clone https://github.com/AayushGargCoder/Natours.git
npm install 
create a .env file in root directory with following content
    NODE_ENV=development
    PORT
    DATABASE=your-mongo-db-uri
    DATABASE_PASSWORD
    JWT_SECRET=your-secret-key
    JWT_EXPIRES_IN
    STRIPE_SECRET_KEY=your-stripe-secret-key
npm start

```

## Features
User Authentication: Secure login and registration with JWT tokens.
Tour Booking: Users can browse available tours, book them, and manage their bookings.
Payment Integration: Secure payment processing through Stripe.
Geospatial Queries: Users can find tours near their location using geospatial data.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
