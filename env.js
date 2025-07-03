import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT,
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD
}