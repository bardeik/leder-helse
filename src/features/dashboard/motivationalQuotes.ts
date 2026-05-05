export interface MotivationalQuote {
  text: string;
  author: string;
}

export const motivationalQuotes: MotivationalQuote[] = [
  { text: "The journey of a thousand miles begins with a single step.", author: "Laozi" },
  { text: "The more he does for others, the happier he is.", author: "Laozi" },
  { text: "The more he gives to others, the wealthier he is.", author: "Laozi" },
  { text: "Those who know do not speak. Those who speak do not know.", author: "Laozi" },
  { text: "To the mind that is still, the whole universe surrenders.", author: "Laozi" },
  { text: "A good traveler has no fixed plans.", author: "Laozi" },
  { text: "He who knows that enough is enough will always have enough.", author: "Laozi" },
  { text: "Mastering others is strength. Mastering yourself is true power.", author: "Laozi" },
  { text: "If you do not change direction, you may end up where you are heading.", author: "Laozi" },
  { text: "When I let go of what I am, I become what I might be.", author: "Laozi" },
  { text: "Isn't it a pleasure to study and practice what you have learned?", author: "Confucius" },
  { text: "I am not bothered when I am not understood. I am bothered when I do not know others.", author: "Confucius" },
  { text: "Reviewing what you have learned and learning anew, you are fit to be a teacher.", author: "Confucius" },
  { text: "To study and not think is a waste. To think and not study is dangerous.", author: "Confucius" },
  {
    text: "What you know, you know; what you do not know, you do not know. This is true knowledge.",
    author: "Confucius"
  },
  { text: "Be loyal and trustworthy.", author: "Confucius" },
  { text: "When making a mistake, do not be afraid to correct it.", author: "Confucius" },
  { text: "If you see what is right and fail to act on it, you lack courage.", author: "Confucius" },
  { text: "Men do not stumble over mountains, but over molehills.", author: "Confucius" },
  {
    text: "By three methods we may learn wisdom: by reflection, by imitation, and by experience.",
    author: "Confucius"
  },
  { text: "It is difficulties that show what men are.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "No thing great is created suddenly.", author: "Epictetus" },
  { text: "Practice yourself in little things, and then proceed to greater.", author: "Epictetus" },
  { text: "It is impossible for anyone to begin to learn what he thinks he already knows.", author: "Epictetus" },
  { text: "If you would be a good reader, read; if a writer, write.", author: "Epictetus" },
  { text: "Whatever you would make habitual, practice it.", author: "Epictetus" },
  { text: "Every habit and faculty is strengthened by the corresponding actions.", author: "Epictetus" },
  { text: "The good or ill of man lies within his own will.", author: "Epictetus" },
  { text: "When I see someone in anxiety, I ask what he wants that is outside his control.", author: "Epictetus" },
  { text: "The universe is change; our life is what our thoughts make it.", author: "Marcus Aurelius" },
  { text: "Concentrate every minute on doing what is in front of you.", author: "Marcus Aurelius" },
  { text: "Perform every act in life as though it were your last.", author: "Marcus Aurelius" },
  { text: "You see how few things you have to do to live a satisfying life?", author: "Marcus Aurelius" },
  { text: "Give yourself time to learn something new and good.", author: "Marcus Aurelius" },
  {
    text: "You could leave life right now. Let that determine what you do and say and think.",
    author: "Marcus Aurelius"
  },
  { text: "Remember that all is opinion.", author: "Marcus Aurelius" },
  { text: "A man should be upright, not kept upright.", author: "Marcus Aurelius" },
  { text: "Never esteem anything as an advantage that makes you lose your self-respect.", author: "Marcus Aurelius" },
  { text: "We are made for mutual assistance.", author: "Marcus Aurelius" },
  { text: "Lay hold of today's task, and you will not need to depend so much upon tomorrow's.", author: "Seneca" },
  {
    text: "The primary indication of a well-ordered mind is the ability to remain in one place and linger in your own company.",
    author: "Seneca"
  },
  { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { text: "The best ideas are common property.", author: "Seneca" },
  { text: "Place value on your time and reckon the worth of each day.", author: "Seneca" },
  { text: "No easy way leads from the earth to heaven.", author: "Seneca" },
  { text: "A good mind possesses a kingdom.", author: "Seneca" },
  { text: "He will find a way - or make one.", author: "Seneca" },
  { text: "We are always getting ready to live, but never living.", author: "Ralph Waldo Emerson" },
  { text: "What is a weed? A plant whose virtues have yet to be discovered.", author: "Ralph Waldo Emerson" }
];

export function getRandomMotivationalQuote(random = Math.random): MotivationalQuote {
  const index = Math.floor(random() * motivationalQuotes.length);
  return motivationalQuotes[index] ?? motivationalQuotes[0]!;
}
