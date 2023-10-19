// eslint-disable-next-line no-use-before-define
import React from 'react';
import { IconButton, Icons, TooltipLinkList, WithTooltip } from '@storybook/components';

/** Exporter component properties */
export interface ExporterToolbarProps {
  /** On Export Theme event */
  onExportTheme: () => void;
  /** On Export Configuration event */
  onExportConfig: () => void;
  /** On Export Component Styling event */
  onExportStyling: () => void;
}

/** Exporter component from Storybook toolbar */
export default class ExporterToolbar extends React.Component<ExporterToolbarProps> {
  /** @inheritdoc */
  public render() {
    return (
      <WithTooltip
        placement="top"
        trigger="click"
        closeOnClick
        tooltip={() => {
          return (
            <TooltipLinkList links={[
              {
                id: 'export-theme',
                title: 'Export Theme',
                onClick: () => this.props.onExportTheme()
              },
              {
                id: 'export-config',
                title: 'Export Configuration',
                onClick: () => this.props.onExportConfig()
              },
              {
                id: 'export-styling',
                title: 'Export Component styling',
                onClick: () => this.props.onExportStyling()
              }
            ]}/>
          );
        }}
      >
        <IconButton key="exporter" nonce="whatever" title="Export Otter properties" rel={undefined} autoFocus content={undefined} rev={undefined}>
          <Icons icon="download" />
        </IconButton>
      </WithTooltip>
    );
  }
}
