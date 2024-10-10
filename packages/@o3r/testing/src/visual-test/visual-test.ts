import * as fs from 'node:fs';
import * as path from 'node:path';
import {PNG} from 'pngjs';
import * as pixelmatch from 'pixelmatch';

export {
  prepareVisualTesting,
  toggleVisualTestingRender
} from './utils';

/** Error types returned by visual testing comparison */
export interface VisualTestMessage {
  /** Error message when base image and actual image have different sizes */
  imagesSize: string;
  /** Error message when base screensot not found */
  baseImgNotFound: string;
  /** Error message when the threshold is passed */
  diffMessage: string;
  /** The message in case of success */
  success: string;
  /** The message in case of generate mode run */
  generateMode: string;
}

/** Error messages in case of visual testing failure */
export const visualTestMessages = {
  imagesSize: 'Image sizes do not match for:',
  diffMessage: 'Diff between images is greater than threshold for:',
  baseImgNotFound: 'Base screenshot file not found:',
  success: 'Visual test successful',
  generateMode: 'Run in generate screenshot mode'
} as const satisfies VisualTestMessage;

/**
 * Object returned by a visual test operation
 */
export interface VisualTestResult {
  /** Error object when base image and actual image have different sizes; Contains the screenshot ffile name */
  imagesSize?: {screenshotName: string};
  /** Error object when base screensot not found. Contains the not found path as a string */
  baseScreenshotNotFound?: {baseScreenshotPath: string};
  /** Object containing the actual diff between images as percentage, the threshold and screenshot file name */
  diff?: {actualDiff: number; threshold: number; screenshotName: string};
  /** Run only generation of screenshots */
  generateMode?: boolean;
}

/**
 * Visual test matcher
 * Based on the VisualTestResult object return by compareScreenshots function, this matcher will compute the error messages
 */
export function toBeVisuallySimilar() {
  return {
    compare: (actual: VisualTestResult, _expected: VisualTestResult) => {
      if (actual.generateMode) {
        return {
          pass: true,
          message: visualTestMessages.generateMode
        };
      }
      if (actual.baseScreenshotNotFound) {
        return {
          pass: false,
          message: `${visualTestMessages.baseImgNotFound} ${actual.baseScreenshotNotFound.baseScreenshotPath}`};
      }
      if (actual.imagesSize) {
        return {
          pass: false,
          message: `${visualTestMessages.imagesSize} ${actual.imagesSize.screenshotName}`
        };
      }
      if (actual.diff && actual.diff.actualDiff > actual.diff.threshold) {
        return {
          pass: false,
          message: `${actual.diff.actualDiff} > ${actual.diff.threshold} : ${visualTestMessages.diffMessage} ${actual.diff.screenshotName}`
        };
      }
      return {
        pass: true,
        message: visualTestMessages.success
      };
    }
  };
}

/**
 * It will create a file for the passed screenshot object.
 * The path of the new file will be calculated using the parameters
 * Ex: ./dist-screenshots\OWBooking\windows_chrome_91\fare-page-after-click-on-continue-0.png
 * distScreenshotsDir/scenarionName/device/filenameWithoutExtension.png
 * @param screenshot The screenshot object captured. Ex: for protractor - browser.takeScreenshot()
 * @param scenarioName E2e Scenario class name
 * @param device Details of the platform on which the test is run. If there are spaces the helper will do the concatenation. Ex: `Windows 10 chrome 89`
 * @param filenameWithoutExtension file name to save the screenshot - .png will be added at the end
 * @param distScreenshotsDir Name of the directory to save the screenshots
 */
export function saveScreenshot(screenshot: string, scenarioName: string, device: string, filenameWithoutExtension: string, distScreenshotsDir = 'dist-screenshots') {
  const screenshotsDir = path.resolve(distScreenshotsDir, scenarioName, `${device.replace(/ +/g, '_')}`);
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, {recursive: true});
  }
  const fullFileName = `${filenameWithoutExtension}.png`;
  const stream = fs.createWriteStream(path.resolve(screenshotsDir, fullFileName));
  stream.write(Buffer.from(screenshot, 'base64'));
  stream.end();
}

/**
 * Write the 3 images (base/new/diff) on the reports folder
 * The path inside the reports forlder will be calculated using the parameters
 * @param pathToScenarioReport Path where the scenario report is saved inside reports folder
 * @param screenshotsDirName Name of the directory which will contain the 3 images
 * @param diff diff image
 * @param baseImage the base image
 * @param currentImg the actual taken screenshot image
 */
export function writeScreenshotsDiff(pathToScenarioReport: string, screenshotsDirName: string, diff: PNG, baseImage: PNG, currentImg: PNG) {
  const destScreenshotsDiffDir = path.join(pathToScenarioReport, 'screenshots-diff', screenshotsDirName);
  if (!fs.existsSync(destScreenshotsDiffDir)) {
    fs.mkdirSync(destScreenshotsDiffDir, { recursive: true });
  }

  const diffPath = path.resolve(destScreenshotsDiffDir, 'diff.png');
  const oldPath = path.resolve(destScreenshotsDiffDir, 'old.png');
  const newPath = path.resolve(destScreenshotsDiffDir, 'new.png');
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  fs.writeFileSync(oldPath, PNG.sync.write(baseImage));
  fs.writeFileSync(newPath, PNG.sync.write(currentImg));
}

/**
 * Compare images helper function. If the comparison fails the 3 images (base/new/diff) will be written inside the reports folder of the actual scenario
 * @param screenshot Actual captured screenshot object
 * @param baseImagePath The path to the base screenshot
 * @param threshold The diff between base screenshot and the current one should not be bigger than this value.
 * @param pathToScenarioReport Path where the scenario report is saved inside reports folder. Used to compute the path to write diff images in case there is a diff at comparison
 * @returns An object of visual test result type
 */
export function compareScreenshot(screenshot: string, baseImagePath: string, threshold: number, pathToScenarioReport: string): VisualTestResult {
  const baseImageExists = fs.existsSync(baseImagePath);
  if (!baseImageExists) {
    return {baseScreenshotNotFound: {baseScreenshotPath: baseImagePath}};
  }
  else {
    const baseImage = PNG.sync.read(fs.readFileSync(baseImagePath));
    const {width, height} = baseImage;
    const diff = new PNG({width, height});

    const screenshotBuffer = Buffer.from(screenshot, 'base64');
    const currentImg = PNG.sync.read(screenshotBuffer);
    const diffDirName = path.basename(baseImagePath, '.png');
    let result;
    try {
      result = pixelmatch(baseImage.data, currentImg.data, diff.data, width, height, {threshold: 0.1});
    } catch (err: any) {
      if (err.toString().indexOf('Image sizes do not match.') === -1) {
        throw err;
      }
      writeScreenshotsDiff(pathToScenarioReport, diffDirName, diff, baseImage, currentImg);
      return {imagesSize: {screenshotName: diffDirName}};
    }
    const pr = Math.round(100 * 100 * result / (width * height)) / 100;
    if (pr > threshold) {
      writeScreenshotsDiff(pathToScenarioReport, diffDirName, diff, baseImage, currentImg);
    }
    return {diff: {actualDiff: pr, threshold, screenshotName: diffDirName}};
  }
}

/**
 * Helper function to perform a visual test operation
 * @param screenshotObj Ex: for protractor browser.takeScreenshot()
 * @param filenameWithoutExtension file name to save the screenshot - .png will be added at the end
 * @param device os followed by browser version - ex: `Windows 10 chrome 89`
 * @param scenarioName E2e Scenario class name
 * @param pathToScenarioReport Path used in compare mode for saving the base,new,diff images in reports in case there is a diff
 * @param threshold The diff between base screenshot and the current one should not be bigger than this value.
 * If the diff is bigger, 3 png files will be created: base screenshot, new screenshot and diff image
 * @param generateMode If true it will generate the screenshot file without screenshots comparison
 * @param baseScreenshotsDirPath The folder path to search base screenshots; used only in compare mode
 */
export function o3rVisualTest(
  screenshotObj: string,
  filenameWithoutExtension: string,
  device: string,
  scenarioName: string,
  pathToScenarioReport = 'reports',
  threshold = 0,
  generateMode = false,
  baseScreenshotsDirPath = 'dist-screenshots-base'
) {
  if (generateMode) {
    saveScreenshot(screenshotObj, scenarioName, device, filenameWithoutExtension);
    return {generateMode: true};
  } else {
    const baseImagePath = path.resolve(baseScreenshotsDirPath, scenarioName, device, `${filenameWithoutExtension}.png`);
    const visualTestResult = compareScreenshot(screenshotObj, baseImagePath, threshold, pathToScenarioReport);
    return visualTestResult;
  }
}
