import type {
  WHITELISTED_HOSTS_KEY as Key
} from './interface';

const WHITELISTED_HOSTS_KEY: typeof Key = 'WHITELISTED_HOSTS';

const saveOptions = () => {
  const whitelistHosts = (document.querySelector('#hosts') as HTMLTextAreaElement).value.split('\n');
  return chrome.storage.sync.set({ [WHITELISTED_HOSTS_KEY]: whitelistHosts });
};

const restoreOptions = async () => {
  const { [WHITELISTED_HOSTS_KEY]: whitelistHosts = ['localhost'] } = (await chrome.storage.sync.get<Record<string, string[] | undefined>>(WHITELISTED_HOSTS_KEY));
  (document.querySelector('#hosts') as HTMLTextAreaElement).value = whitelistHosts.join('\n');
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save')!.addEventListener('click', saveOptions);
