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
  private initialization?: Promise<void>;

  static getInstance(): TooltipHelper {
    if (!TooltipHelper._instance) {
      TooltipHelper._instance = new TooltipHelper();
    }
    return TooltipHelper._instance;
  }

  init(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }
    if (!this.initialization) {
      this.initialization = (async () => {
        try {
          const response = await fetch(TOOLTIP_URL);
          if (!response.ok) return;
          this.tooltips = (await response.json()) as Record<string, TooltipData>;
          this.initialized = true;
        } catch {
          // Tooltips are non-critical; silently ignore failures and allow a retry.
        }
      })().finally(() => {
        this.initialization = undefined;
      });
    }
    return this.initialization;
  }

  getTooltip(key: string): TooltipData | undefined {
    return this.tooltips[key];
  }
}

export default TooltipHelper;
