import fs from 'fs';
import * as readline from 'readline';

const NAME_DISCOVERIES_FILE = 'src/discovered_names.txt';

if (!fs.existsSync(NAME_DISCOVERIES_FILE)) {
    fs.writeFileSync(NAME_DISCOVERIES_FILE, 'Hugo Houdain');
}

const discoveredNamesData = fs
    .readFileSync('src/discovered_names.txt')
    .toString();
const discoveredNames = discoveredNamesData.split('\n');

const fakeLoading = () => {
    const loading = ['\\', '|', '/', '-'];
    let i = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\rSaving discoveries... ${loading[i++]}`);
        i &= 3;
    }, 250);
    setTimeout(() => {
        clearInterval(interval);
        console.log('\n\n✨All your discoveries have been saved!✨');
    }, 2000);
};

const askQuestion = (query: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        }),
    );
};

const chooseBaseName = async (): Promise<string | void> => {
    console.clear();
    console.log('🔥 Welcome to the Houdain Name Generator 🔥');
    console.log('\nWill you be the first to discover new Houdain names!\n');
    return await askQuestion('Enter the base name: ');
};

const generateRandomName = ({ baseName }: { baseName: string }) => {
    const getRandomConsonant = () => {
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        return consonants[
            Math.floor(Math.random() * consonants.length)
        ].toUpperCase();
    };

    const removeFirstLetters = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.slice(1))
            .join(' ');
    };

    const cutName = removeFirstLetters(baseName);

    return `${getRandomConsonant()}${
        cutName.split(' ')[0]
    } ${getRandomConsonant()}${cutName.split(' ')[1]}`;
};

const processLoop = async ({ baseName }: { baseName: string }) => {
    while (true) {
        console.clear();
        const answer = await askQuestion(
            '1 - Generate a new name\n2 - View all discoveries\n3 - Exit and save discoveries\n\nChoose an option: ',
        );
        if (answer === '2') {
            console.clear();
            console.log('📜 All your discoveries 📜\n');
            discoveredNames.forEach((name, index) => {
                if (name) console.log(`${index + 1} - ${name}`);
            });
            await askQuestion('\nPress Enter to continue...');
            continue;
        }
        if (answer === '3') break;
        const name = generateRandomName({ baseName });
        if (discoveredNames.includes(name)) {
            console.log(`🛑 Name already discovered: ${name}`);
            continue;
        }
        console.log(`\n✨ First Discovery: ${name}`);
        discoveredNames.push(name);
        await askQuestion('\nPress Enter to continue...');
    }
};

async function main() {
    const baseName = await chooseBaseName();
    if (!baseName || baseName === '' || baseName.split(' ').length < 2) {
        console.log('👋 Invalid base name. Exiting...');
        return;
    }

    await processLoop({
        baseName,
    });
    console.clear();
    fs.writeFile(NAME_DISCOVERIES_FILE, discoveredNames.join('\n'), (err) => {
        if (err) return console.log(err);
        console.log(
            `writing new discoveries to \`${NAME_DISCOVERIES_FILE}\`...`,
        );
        fakeLoading();
    });
}

main();
