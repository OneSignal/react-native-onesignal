export enum InAppMessageType {
  TopBanner = 'top_banner',
  BottomBanner = 'bottom_banner',
  CenterModal = 'center_modal',
  Html = 'html',
  FullScreen = 'full_screen',
  FullBleed = 'full_bleed',
  Carousel = 'carousel',
  CarouselBleed = 'carousel_bleed',
}

export const iamTypeLabel: Record<InAppMessageType, string> = {
  [InAppMessageType.TopBanner]: 'TOP',
  [InAppMessageType.BottomBanner]: 'BOTTOM',
  [InAppMessageType.CenterModal]: 'CENTER',
  [InAppMessageType.Html]: 'HTML',
  [InAppMessageType.FullScreen]: 'FULL',
  [InAppMessageType.FullBleed]: 'FULL BLEED',
  [InAppMessageType.Carousel]: 'CAROUSEL',
  [InAppMessageType.CarouselBleed]: 'CAROUSEL BLEED',
};
