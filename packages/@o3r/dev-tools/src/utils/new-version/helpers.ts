/**
 * Extract the list of tags and remove any spaces or endlines
 *
 * @param gitOutput response from git command to format
 */
export function formatGitTagsOutput(gitOutput: string) {
  return gitOutput.split(/[\r\n\s]+/g)
    .map((val) => val.replace('remotes/origin/', ''))
    .filter((val) => !!val);
}
