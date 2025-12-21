// DuplaS2 Animation Utilities
import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';

// Spring configuration for bouncy animations
export const springConfig = {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
};

// Timing configurations
export const timingConfig = {
    fast: { duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true },
    normal: { duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true },
    slow: { duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true },
};

// Create animated value with initial value
export const createAnimatedValue = (initialValue: number = 0) => new Animated.Value(initialValue);

// Fade in animation
export const fadeIn = (
    animatedValue: Animated.Value,
    duration: number = 300,
    delay: number = 0
) => {
    return Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
    });
};

// Scale animation for button press
export const scaleOnPress = (animatedValue: Animated.Value, toValue: number = 0.95) => {
    return Animated.spring(animatedValue, {
        toValue,
        ...springConfig,
    });
};

// Slide up animation
export const slideUp = (
    animatedValue: Animated.Value,
    initialOffset: number = 50,
    duration: number = 400,
    delay: number = 0
) => {
    animatedValue.setValue(initialOffset);
    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
    });
};

// Staggered animation for lists
export const staggeredFadeIn = (
    animatedValues: Animated.Value[],
    staggerDelay: number = 100
) => {
    const animations = animatedValues.map((value, index) =>
        fadeIn(value, 300, index * staggerDelay)
    );
    return Animated.parallel(animations);
};

// Pulse animation
export const createPulse = (animatedValue: Animated.Value, duration: number = 1500) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1.1,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

// Haptic feedback utilities
export const haptic = {
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    selection: () => Haptics.selectionAsync(),
};

// Animated pressable utilities
export const usePressAnimation = () => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
        haptic.light();
        Animated.spring(scale, { toValue: 0.96, ...springConfig }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, { toValue: 1, ...springConfig }).start();
    };

    return { scale, onPressIn, onPressOut };
};
