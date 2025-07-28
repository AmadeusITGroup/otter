/**
 * Model: EasingType
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * This type is a string enum with the following possible values:  - `EASE_IN`: Ease in with an animation curve similar to CSS ease-in. - `EASE_OUT`: Ease out with an animation curve similar to CSS ease-out. - `EASE_IN_AND_OUT`: Ease in and then out with an animation curve similar to CSS ease-in-out. - `LINEAR`: No easing, similar to CSS linear. - `EASE_IN_BACK`: Ease in with an animation curve that moves past the initial keyframe's value and then accelerates as it reaches the end. - `EASE_OUT_BACK`: Ease out with an animation curve that starts fast, then slows and goes past the ending keyframe's value. - `EASE_IN_AND_OUT_BACK`: Ease in and then out with an animation curve that overshoots the initial keyframe's value, then accelerates quickly before it slows and overshoots the ending keyframes value. - `CUSTOM_CUBIC_BEZIER`: User-defined cubic bezier curve. - `GENTLE`: Gentle animation similar to react-spring. - `QUICK`: Quick spring animation, great for toasts and notifications. - `BOUNCY`: Bouncy spring, for delightful animations like a heart bounce. - `SLOW`: Slow spring, useful as a steady, natural way to scale up fullscreen content. - `CUSTOM_SPRING`: User-defined spring animation.
 */
export type EasingType = 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_AND_OUT' | 'LINEAR' | 'EASE_IN_BACK' | 'EASE_OUT_BACK' | 'EASE_IN_AND_OUT_BACK' | 'CUSTOM_CUBIC_BEZIER' | 'GENTLE' | 'QUICK' | 'BOUNCY' | 'SLOW' | 'CUSTOM_SPRING';
