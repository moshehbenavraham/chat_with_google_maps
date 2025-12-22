/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

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
  className = '',
}: SourcesPopoverProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'inline-flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-sm font-medium',
            'bg-[var(--Neutral-10)] text-[var(--Neutral-90)]',
            'border-2 border-[var(--Neutral-50)]',
            'hover:bg-[var(--Neutral-20)] hover:border-[var(--Neutral-60)]',
            'transition-all duration-200 ease-in-out',
            className
          )}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          'min-w-[280px] max-w-[400px] max-h-[350px] overflow-y-auto p-2',
          'rounded-lg bg-[var(--Neutral-10)] border border-[var(--Neutral-30)]',
          'shadow-lg text-sm leading-6 z-50'
        )}
      >
        <div className="GMP-attribution text-xs px-3 py-1 opacity-80 border-b border-[var(--Neutral-30)] mb-1">
          Google Maps Grounded Result
        </div>
        {sources.map(source => (
          <a
            key={source.uri}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'block px-3 py-2.5 rounded-md font-normal',
              'text-[var(--Neutral-90)] no-underline',
              'border-l-[3px] border-l-transparent',
              'transition-all duration-150 ease-in-out',
              'hover:bg-[var(--Neutral-20)] hover:border-l-[var(--accent-blue)] hover:text-white',
              'focus:outline-2 focus:outline-[var(--accent-blue)] focus:outline-offset-[-2px] focus:bg-[var(--Neutral-20)]',
              '[&+&]:border-t [&+&]:border-t-[var(--Neutral-30)]'
            )}
          >
            {source.title}
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}
