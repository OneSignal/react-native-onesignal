export interface TooltipOption {
  name: string;
  description: string;
}

export interface TooltipData {
  title: string;
  description: string;
  options?: TooltipOption[];
}

const TOOLTIP_URL =
  'https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json';

class TooltipHelper {
  private static _instance: TooltipHelper;
  private tooltips: Record<string, TooltipData> = {};
  private initialized = false;

  static getInstance(): TooltipHelper {
    if (!TooltipHelper._instance) {
      TooltipHelper._instance = new TooltipHelper();
    }
    return TooltipHelper._instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    try {
      const response = await fetch(TOOLTIP_URL);
      if (response.ok) {
        const json = await response.json();
        this.tooltips = json as Record<string, TooltipData>;
      }
    } catch {
      // Tooltips are non-critical; silently ignore failures
    }
    this.initialized = true;
  }

  getTooltip(key: string): TooltipData | undefined {
    return this.tooltips[key];
  }
}

export default TooltipHelper;
