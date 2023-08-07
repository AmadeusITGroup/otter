import { createInterface } from 'node:readline';

/**
 * Display a question in the terminal and wait for the user answer
 *
 * @param question Question to ask to the user
 * @returns user's answer
 */
export const askUserInput = async (question: string): Promise<string> => {
  const readline = createInterface({
    terminal: true,
    input: process.stdin,
    output: process.stdout
  });
  const askQuestion = () => new Promise<string>((resolve) => {
    readline.question(`${question} `, resolve);
  });
  const answer = await askQuestion();
  readline.close();
  return answer;
};
