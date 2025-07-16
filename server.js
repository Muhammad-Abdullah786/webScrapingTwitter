import scrap from './scraping.js';
import database from './utility/database.js';
import { program } from 'commander';
import inquirer from 'inquirer';
import { exportData } from './utility/exportData.js';

program
    .option('-u, --url <url>', 'URL to scrape (must be x.com)')
    .option('-p, --max-post <number>', 'Number of posts to scrape');

program.parse(process.argv);
const options = program.opts();

async function askQuestions() {
    const questions = [];

    const urlProvided = options.url && options.url.startsWith("https://x.com/");
    const postsProvided = options.maxPost && !isNaN(options.maxPost);

    if (!urlProvided) {
        questions.push({
            type: 'input',
            name: 'url',
            message: '🔗 Enter the x.com URL you want to scrape:',
            default: 'https://x.com/home',
            validate: input =>
                input.startsWith('https://x.com/') ? true : 'URL must start with https://x.com/',
        });
    }

    if (!postsProvided) {
        questions.push({
            type: 'number',
            name: 'maxPost',
            message: '🔢 How many posts do you want to scrape?',
            default: 10,
            validate: input =>
                input > 0 ? true : 'Enter a number greater than 0',
        });
    }

    questions.push(
        {
            type: 'input',
            name: 'username',
            message: '👤 Twitter username (or email):',
            validate: input => input.length > 2 ? true : 'Enter a valid username',
        },
        {
            type: 'password',
            name: 'password',
            message: '🔒 Twitter password:',
            mask: '*',
            validate: input => input.length > 2 ? true : 'Enter a valid password',
        }
    );

    const answers = await inquirer.prompt(questions);

    return {
        link: urlProvided ? options.url : answers.url,
        maxPost: postsProvided ? Number(options.maxPost) : answers.maxPost,
        username: answers.username,
        password: answers.password,
    };
}

async function main() {
    try {
        const connection = await database.connect();
        console.log(`✅   connected to db :  ${connection.name}`);

        const { link, maxPost, username, password } = await askQuestions();

        await scrap({
            link,
            maxPost,
            username,
            password
        });
        const { exportFormat } = await inquirer.prompt({
            type: 'list',
            name: 'exportFormat',
            message: '📥 Would you like to export the data?',
            choices: ['json', 'csv', 'no'],
        });

        if (exportFormat !== 'no') {
            const mdbCollection = connection.name
            await exportData(mdbCollection, exportFormat)

        }

    } catch (error) {
        console.error(`an error occurred in scraping`, error);
    }
}

main();
