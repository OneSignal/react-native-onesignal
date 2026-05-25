export enum InAppMessageType {
  TopBanner = 'top_banner',
  BottomBanner = 'bottom_banner',
  CenterModal = 'center_modal',
  FullScreen = 'full_screen',
}

export const iamTypeLabel: Record<InAppMessageType, string> = {
  [InAppMessageType.TopBanner]: 'TOP BANNER',
  [InAppMessageType.BottomBanner]: 'BOTTOM BANNER',
  [InAppMessageType.CenterModal]: 'CENTER MODAL',
  [InAppMessageType.FullScreen]: 'FULL SCREEN',
};
