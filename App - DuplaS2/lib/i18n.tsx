import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './translations/en';
import { pt } from './translations/pt';

type Language = 'en' | 'pt';
type Translations = typeof en;

type I18nContextType = {
    t: Translations;
    language: Language;
    setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextType>({
    t: en,
    language: 'en',
    setLanguage: () => { },
});

export function useI18n() {
    return useContext(I18nContext);
}

const LANGUAGE_KEY = '@duplas2_language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
            if (saved === 'pt' || saved === 'en') {
                setLanguageState(saved);
            }
            setIsLoaded(true);
        });
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        AsyncStorage.setItem(LANGUAGE_KEY, lang);
    };

    const translations = language === 'pt' ? pt : en;

    if (!isLoaded) {
        return null; // or a loading spinner
    }

    return (
        <I18nContext.Provider value={{ t: translations, language, setLanguage }}>
            {children}
        </I18nContext.Provider>
    );
}
