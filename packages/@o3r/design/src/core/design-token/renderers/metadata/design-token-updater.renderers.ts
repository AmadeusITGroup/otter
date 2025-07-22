import type {
  DesignContentFileUpdater,
} from '../design-token.renderer.interface';

/**
 * Retrieve a Content Updater function for Metadata generator
 */
export const getMetadataStyleContentUpdater = (): DesignContentFileUpdater => {
  return (variables: string[]) => {
    return JSON.stringify(JSON.parse(`{"variables":{${variables.join(',')}}}`), null, 2);
  };
};
