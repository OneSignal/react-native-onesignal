/**
 * Sentinel string used to round-trip JS `null` values across the React Native
 * iOS TurboModule bridge, which otherwise drops `null` dictionary values
 * before they reach native code. The native side swaps this string back to
 * `[NSNull null]`.
 *
 * The string must not contain NUL bytes: RN's `convertJSIStringToNSString`
 * uses `[NSString stringWithUTF8String:]`, which terminates at the first NUL
 * byte and would silently truncate the sentinel to `@""`. Collision with a
 * customer-supplied string is avoided by the random hex suffix.
 *
 * See SDK-4386.
 */
export const IOS_NULL_SENTINEL = '__OS_RN_NULL_8b3f72d6c1a04f9e__';
