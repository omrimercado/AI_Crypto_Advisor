const path = require('path');
const fs = require('fs');

let memes = [];

// Load memes from JSON file on startup
const loadMemes = () => {
  try {
    const memesPath = path.join(__dirname, '../../../data/memes.json');
    const data = fs.readFileSync(memesPath, 'utf8');
    memes = JSON.parse(data);
    console.log(`Loaded ${memes.length} memes`);
  } catch (error) {
    console.error('Error loading memes:', error.message);
    memes = getDefaultMemes();
  }
};

const getRandomMeme = async () => {
  if (memes.length === 0) {
    loadMemes();
  }

  const randomIndex = Math.floor(Math.random() * memes.length);
  const meme = memes[randomIndex];

  return {
    id: meme.id,
    title: meme.title,
    imageUrl: meme.imageUrl,
    altText: meme.altText
  };
};

const getDefaultMemes = () => [
  {
    id: 'meme-1',
    title: 'HODL!',
    imageUrl: 'https://i.imgflip.com/2/1bgw.jpg',
    altText: 'One does not simply sell during a dip'
  },
  {
    id: 'meme-2',
    title: 'When in doubt, zoom out',
    imageUrl: 'https://i.imgflip.com/2/1bij.jpg',
    altText: 'Galaxy brain: zoom out to yearly chart'
  }
];

// Initialize memes on module load
loadMemes();

module.exports = {
  getRandomMeme,
  loadMemes
};
