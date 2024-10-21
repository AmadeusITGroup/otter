import type {
  WHITELISTED_HOSTS_KEY as Key
} from './interface';

const WHITELISTED_HOSTS_KEY: typeof Key = 'WHITELISTED_HOSTS';

const saveOptions = () => {
  const whitelistHosts = (document.querySelector('#hosts') as HTMLTextAreaElement).value.split('\n');
  return chrome.storage.sync.set({ [WHITELISTED_HOSTS_KEY]: whitelistHosts });
};

const restoreOptions = async () => {
  const whitelistHosts = (await chrome.storage.sync.get(WHITELISTED_HOSTS_KEY))[WHITELISTED_HOSTS_KEY] as string[] || ['localhost'];
  (document.querySelector('#hosts') as HTMLTextAreaElement).value = whitelistHosts.join('\n');
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save')!.addEventListener('click', saveOptions);
