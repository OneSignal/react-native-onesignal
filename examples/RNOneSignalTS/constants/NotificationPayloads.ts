/**
 * Notification payload templates for OneSignal demo app.
 * Ported from Android SDK demo app's NotificationData.java
 *
 * Each notification type has 3 variations that are randomly selected when sending.
 */

export interface NotificationButton {
  id: string;
  text: string;
  icon: string;
}

export interface NotificationPayload {
  heading: string;
  content: string;
  largeIcon?: string;
  bigPicture?: string;
  buttons?: NotificationButton[];
}

export interface NotificationTemplate {
  id: string;
  title: string;
  icon: string;
  variations: NotificationPayload[];
}

// Firebase Storage base URLs for notification icons and images
const FIREBASE_BASE_URL =
  'https://firebasestorage.googleapis.com/v0/b/onesignaltest-e7802.appspot.com/o/NOTIFICATION_ICON%2F';

// Helper function to build Firebase Storage URLs
const buildIconUrl = (filename: string): string => {
  const tokenMap: { [key: string]: string } = {
    'bell_red.png': 'c80c4e76-1fd7-4912-93f4-f1aee1d98b20',
    'human-greeting-red.png': 'cb9f3418-db61-443c-955a-57e664d30271',
    'brightness-percent-red.png': '9e43c45e-8bcc-413e-8a42-612020c406ba',
    'cart-red.png': '3e9ca206-540c-4275-8f21-1840e9cba930',
    'image-red.png': '3f44fd3d-27a5-4d05-9544-423edf2f6284',
    'gesture-tap-red.png': '8ea7f6db-18e4-4fdd-aabf-ac97f04522fd',
    'star-red.png': 'e18e99ce-96ad-4ee5-b0b9-40c7f90613d1',
  };
  return `${FIREBASE_BASE_URL}${filename}?alt=media&token=${tokenMap[filename]}`;
};

/**
 * GENERAL NOTIFICATIONS - Social interactions and user engagement
 */
const GENERAL_VARIATIONS: NotificationPayload[] = [
  {
    heading: 'Liked post',
    content: 'Michael DiCioccio liked your post!',
    largeIcon: buildIconUrl('bell_red.png'),
  },
  {
    heading: 'Birthdays',
    content: 'Say happy birthday to Rodrigo and 5 others!',
    largeIcon:
      'https://images.vexels.com/media/users/3/147226/isolated/preview/068af50eededd7a739aac52d8e509ab5-three-candles-birthday-cake-icon-by-vexels.png',
  },
  {
    heading: 'New Post',
    content: 'Neil just posted for the first time in while, check it out!',
    largeIcon: buildIconUrl('bell_red.png'),
  },
];

/**
 * GREETINGS - Welcome messages from brands and platforms
 */
const GREETING_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'Welcome to Nike!',
    largeIcon: buildIconUrl('human-greeting-red.png'),
  },
  {
    heading: '',
    content: 'Welcome to Adidas!',
    largeIcon: buildIconUrl('human-greeting-red.png'),
  },
  {
    heading: '',
    content: "Welcome to Sandra's cooking blog!",
    largeIcon: buildIconUrl('human-greeting-red.png'),
  },
];

/**
 * PROMOTIONS - Sales, discounts, and special offers
 */
const PROMOTION_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'Get 20% off site-wide!',
    largeIcon: buildIconUrl('brightness-percent-red.png'),
  },
  {
    heading: '',
    content: 'Half-off all shoes today only!',
    largeIcon: buildIconUrl('brightness-percent-red.png'),
  },
  {
    heading: '',
    content: '3 hour flash sale!',
    largeIcon: buildIconUrl('brightness-percent-red.png'),
  },
];

/**
 * BREAKING NEWS - News articles with action buttons
 */
const BREAKING_NEWS_VARIATIONS: NotificationPayload[] = [
  {
    heading: 'The rap game wont be the same',
    content: 'Nipsey Hussle shot dead in his own hometown!',
    largeIcon:
      'https://pbs.twimg.com/profile_images/719602655337656321/kQUzR2Es_400x400.jpg',
    bigPicture:
      'https://lab.fm/wp-content/uploads/2019/04/nipsey-hussle-cipriani-diamond-ball-2018-nyc-credit-jstone-shutterstock@1800x1013.jpg',
    buttons: [
      { id: 'view', text: 'View', icon: 'ic_menu_view' },
      { id: 'save', text: 'Save', icon: 'ic_menu_save' },
      { id: 'share', text: 'Share', icon: 'ic_menu_share' },
    ],
  },
  {
    heading: 'CNN being bought by Fox?',
    content:
      'Fox has shown an increasing interest in purchasing Fox and because of some other deals this year it could actually happen!',
    largeIcon:
      'https://www.thewrap.com/sites/default/wp-content/uploads/files/2013/Jul/08/101771/gallupinside.png',
    bigPicture: 'https://i.ytimg.com/vi/C8YBKBuX43Q/maxresdefault.jpg',
    buttons: [
      { id: 'view', text: 'View', icon: 'ic_menu_view' },
      { id: 'save', text: 'Save', icon: 'ic_menu_save' },
      { id: 'share', text: 'Share', icon: 'ic_menu_share' },
    ],
  },
  {
    heading: 'Teslas next venture!',
    content: 'Tesla releasing fully autonomous driving service!',
    largeIcon:
      'https://i.etsystatic.com/13567406/r/il/6657a5/1083941709/il_794xN.1083941709_k3vi.jpg',
    bigPicture:
      'https://electrek.co/wp-content/uploads/sites/3/2018/01/screen-shot-2018-01-04-at-12-59-25-pm.jpg?quality=82&strip=all&w=1600',
    buttons: [
      { id: 'view', text: 'View', icon: 'ic_menu_view' },
      { id: 'save', text: 'Save', icon: 'ic_menu_save' },
      { id: 'share', text: 'Share', icon: 'ic_menu_share' },
    ],
  },
];

/**
 * ABANDONED CART - Shopping cart reminders
 */
const ABANDONED_CART_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'You have some shoes left in your cart!',
    largeIcon: buildIconUrl('cart-red.png'),
  },
  {
    heading: '',
    content: 'Still want to buy the dress you saw?',
    largeIcon: buildIconUrl('cart-red.png'),
  },
  {
    heading: '',
    content: '20% off the shoes you saw today.',
    largeIcon: buildIconUrl('cart-red.png'),
  },
];

/**
 * NEW POST - Blog and content updates
 */
const NEW_POST_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'I just published a new blog post!',
    largeIcon: buildIconUrl('image-red.png'),
  },
  {
    heading: '',
    content: 'Come check out my new blog post on aliens!',
    largeIcon: buildIconUrl('image-red.png'),
  },
  {
    heading: '',
    content: '10 places you have to see before you die.',
    largeIcon: buildIconUrl('image-red.png'),
  },
];

/**
 * RE-ENGAGEMENT - User re-activation messages
 */
const RE_ENGAGEMENT_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'Your friend George just joined Facebook',
    largeIcon: buildIconUrl('gesture-tap-red.png'),
  },
  {
    heading: '',
    content: 'Can you beat level 23?',
    largeIcon: buildIconUrl('gesture-tap-red.png'),
  },
  {
    heading: '',
    content: 'Check out our Fall collection!',
    largeIcon: buildIconUrl('gesture-tap-red.png'),
  },
];

/**
 * RATING - Feedback and rating requests
 */
const RATING_VARIATIONS: NotificationPayload[] = [
  {
    heading: '',
    content: 'How was your food/experience at Chipotle?',
    largeIcon: buildIconUrl('star-red.png'),
  },
  {
    heading: '',
    content: 'Rate your experience with Amazon.',
    largeIcon: buildIconUrl('star-red.png'),
  },
  {
    heading: '',
    content: 'Let your Lyft driver know how the ride was.',
    largeIcon: buildIconUrl('star-red.png'),
  },
];

/**
 * All notification templates organized by type
 */
export const NotificationTemplates: NotificationTemplate[] = [
  {
    id: 'GENERAL',
    title: 'General',
    icon: '🔔',
    variations: GENERAL_VARIATIONS,
  },
  {
    id: 'GREETINGS',
    title: 'Greetings',
    icon: '👋',
    variations: GREETING_VARIATIONS,
  },
  {
    id: 'PROMOTIONS',
    title: 'Promotions',
    icon: '💰',
    variations: PROMOTION_VARIATIONS,
  },
  {
    id: 'BREAKING_NEWS',
    title: 'Breaking News',
    icon: '📰',
    variations: BREAKING_NEWS_VARIATIONS,
  },
  {
    id: 'ABANDONED_CART',
    title: 'Abandoned Cart',
    icon: '🛒',
    variations: ABANDONED_CART_VARIATIONS,
  },
  {
    id: 'NEW_POST',
    title: 'New Post',
    icon: '📝',
    variations: NEW_POST_VARIATIONS,
  },
  {
    id: 'RE_ENGAGEMENT',
    title: 'Re-Engagement',
    icon: '🎯',
    variations: RE_ENGAGEMENT_VARIATIONS,
  },
  {
    id: 'RATING',
    title: 'Rating',
    icon: '⭐',
    variations: RATING_VARIATIONS,
  },
];
