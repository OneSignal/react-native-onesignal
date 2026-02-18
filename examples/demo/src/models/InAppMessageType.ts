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

export const iamTypeIcon: Record<InAppMessageType, string> = {
  [InAppMessageType.TopBanner]: 'arrow-up-bold-box-outline',
  [InAppMessageType.BottomBanner]: 'arrow-down-bold-box-outline',
  [InAppMessageType.CenterModal]: 'crop-square',
  [InAppMessageType.FullScreen]: 'fullscreen',
};
