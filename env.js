import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT,
    PASSWORD: process.env.PASSWORD,
    USERNAME: process.env.NAME,
}