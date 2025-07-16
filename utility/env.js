import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT,
    PASSWORD: process.env.PASSWORD,
    USERNAME: process.env.NAME,
    DATABASE: process.env.DATABASE_URL,
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.SECRET,
}