import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TickerBadgeProps {
  status: string;
  error_message?: string;
}

export default function TickerBadge({ status, error_message }: TickerBadgeProps) {
  const safeStatus = status || 'unknown';
  const badge =
    <Badge variant={
      safeStatus.toLowerCase() === 'active'
        ? 'default'
        : safeStatus.toLowerCase() === 'error'
        ? 'destructive'
        : 'secondary'
    }>
      {safeStatus}
    </Badge>

  return(
    error_message ? (
      <Tooltip>
        <TooltipTrigger>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          {error_message}
        </TooltipContent>
      </Tooltip>
    ) : (
      badge
  ))
}
