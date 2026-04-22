import { E2E_MODE } from '@env';

const MASK_CHAR = '•';

export function maskValue(value: string): string {
  if (E2E_MODE === 'true') {
    return MASK_CHAR.repeat(value.length);
  }
  return value;
}
