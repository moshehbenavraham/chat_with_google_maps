/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import './sources-popover.css';

interface SourceLink {
  uri: string;
  title: string;
}

interface SourcesPopoverProps {
  sources: SourceLink[];
  buttonText?: string;
  className?: string;
}

export function SourcesPopover({
  sources,
  buttonText = 'Sources',
  className = ''
}: SourcesPopoverProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Popover className={`popover ${className}`}>
      <PopoverButton className="popover-button">
        {buttonText}
      </PopoverButton>
      <PopoverPanel transition className="popover-panel">
        <div className="GMP-attribution">Google Maps Grounded Result</div>
        {sources.map((source) => (
          <a
            key={source.uri}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link">
            {source.title}
          </a>
        ))}
      </PopoverPanel>
    </Popover>
  );
}
