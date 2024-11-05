import {
  cleanVirtualFileSystem,
  useVirtualFileSystem
} from '@o3r/test-helpers';

useVirtualFileSystem();

afterAll(() => {
  cleanVirtualFileSystem();
});
