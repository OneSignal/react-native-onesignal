import { Alert } from 'react-native';
import { TooltipContent, TooltipData } from '../constants/TooltipContent';

/**
 * Shows a tooltip dialog for the given key
 * @param key - The tooltip key from TooltipContent
 */
export function showTooltip(key: string): void {
  const tooltip = TooltipContent[key];
  if (!tooltip) {
    console.warn(`Tooltip not found for key: ${key}`);
    return;
  }

  let message = tooltip.description;

  // If there are options, append them to the message
  if (tooltip.options && tooltip.options.length > 0) {
    message += '\n\n';
    tooltip.options.forEach((option, index) => {
      message += `${option.name}: ${option.description}`;
      if (index < tooltip.options!.length - 1) {
        message += '\n\n';
      }
    });
  }

  Alert.alert(tooltip.title, message, [{ text: 'OK' }]);
}

/**
 * Gets tooltip data for a given key
 * @param key - The tooltip key from TooltipContent
 * @returns TooltipData or undefined if not found
 */
export function getTooltip(key: string): TooltipData | undefined {
  return TooltipContent[key];
}
