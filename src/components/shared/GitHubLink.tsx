import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const REPO_URL =
  (import.meta.env.VITE_PUBLIC_GITHUB_REPO as string | undefined) ||
  'https://github.com/Andy8647/CarbCyclingWeb';

export function GitHubLink() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" aria-label="Open GitHub repository">
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
            <Github className="size-5" />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Open on GitHub</TooltipContent>
    </Tooltip>
  );
}
