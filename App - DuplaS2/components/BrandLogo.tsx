import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { BillCategory, billCategories } from '../lib/billTypes';

// Import all brand logos
import NetflixLogo from '../assets/logos/netflix.svg';
import SpotifyLogo from '../assets/logos/spotify.svg';
import AmazonLogo from '../assets/logos/amazon.svg';
import YouTubeLogo from '../assets/logos/youtube.svg';
import AppleLogo from '../assets/logos/apple.svg';
import GoogleLogo from '../assets/logos/google.svg';
import MetaLogo from '../assets/logos/meta.svg';
import TikTokLogo from '../assets/logos/tiktok.svg';
import WhatsAppLogo from '../assets/logos/whatsapp.svg';
import TwitterLogo from '../assets/logos/twitter.svg';
import InternetLogo from '../assets/logos/internet.svg';
import DiscordLogo from '../assets/logos/discord.svg';
import HuluLogo from '../assets/logos/hulu.svg';
import PeacockLogo from '../assets/logos/peacock.svg';

// Telecom
import VerizonLogo from '../assets/logos/verizon.svg';
import TMobileLogo from '../assets/logos/tmobile.svg';
import AttLogo from '../assets/logos/att.svg';
// import XfinityLogo from '../assets/logos/xfinity.svg'; // Use Verizon as placeholder or create generic

// Bank
import ChaseLogo from '../assets/logos/chase.svg';
import BoaLogo from '../assets/logos/boa.svg';
import WellsFargoLogo from '../assets/logos/wellsfargo.svg';
import CitiLogo from '../assets/logos/citi.svg';
import AmexLogo from '../assets/logos/amex.svg';
import CapitalOneLogo from '../assets/logos/capitalone.svg';

// Insurance
import GeicoLogo from '../assets/logos/geico.svg';
import StateFarmLogo from '../assets/logos/statefarm.svg';
import ProgressiveLogo from '../assets/logos/progressive.svg';

// Retail & Services
import CostcoLogo from '../assets/logos/costco.svg';
import WalmartLogo from '../assets/logos/walmart.svg';
import TargetLogo from '../assets/logos/target.svg';
import StarbucksLogo from '../assets/logos/starbucks.svg';
import PlanetFitnessLogo from '../assets/logos/planetfitness.svg';
import UberLogo from '../assets/logos/uber.svg';
import LyftLogo from '../assets/logos/lyft.svg';
import DoorDashLogo from '../assets/logos/doordash.svg';
import XboxLogo from '../assets/logos/xbox.svg';

type BrandLogoProps = {
    billName: string;
    category?: BillCategory;
    size?: number;
    fallbackColor?: string;
};

// Map of brand keywords to their logos
const BRAND_LOGOS: Record<string, React.FC<SvgProps>> = {
    // Streaming
    netflix: NetflixLogo,
    spotify: SpotifyLogo,
    amazon: AmazonLogo,
    prime: AmazonLogo,
    aws: AmazonLogo,
    youtube: YouTubeLogo,
    google: GoogleLogo,
    hulu: HuluLogo,
    peacock: PeacockLogo,
    disney: NetflixLogo, // Fallback
    hbo: NetflixLogo, // Fallback

    // Tech
    apple: AppleLogo,
    icloud: AppleLogo,
    microsoft: XboxLogo,
    xbox: XboxLogo,
    meta: MetaLogo,
    facebook: MetaLogo,
    instagram: MetaLogo,
    tiktok: TikTokLogo,
    twitter: TwitterLogo,
    x: TwitterLogo,
    discord: DiscordLogo,
    chatgpt: InternetLogo,
    openai: InternetLogo,

    // Telecom
    verizon: VerizonLogo,
    't-mobile': TMobileLogo,
    tmobile: TMobileLogo,
    att: AttLogo,
    'at&t': AttLogo,
    xfinity: InternetLogo,
    spectrum: InternetLogo,
    internet: InternetLogo,
    wifi: InternetLogo,

    // Finance
    chase: ChaseLogo,
    'bank of america': BoaLogo,
    boa: BoaLogo,
    'wells fargo': WellsFargoLogo,
    citi: CitiLogo,
    citibank: CitiLogo,
    amex: AmexLogo,
    'american express': AmexLogo,
    'capital one': CapitalOneLogo,

    // Insurance
    geico: GeicoLogo,
    'state farm': StateFarmLogo,
    progressive: ProgressiveLogo,
    allstate: ProgressiveLogo, // Fallback
    insurance: ProgressiveLogo, // Fallback

    // Retail & Services
    costco: CostcoLogo,
    walmart: WalmartLogo,
    target: TargetLogo,
    starbucks: StarbucksLogo,
    'planet fitness': PlanetFitnessLogo,
    gym: PlanetFitnessLogo,
    uber: UberLogo,
    lyft: LyftLogo,
    doordash: DoorDashLogo,
    food: DoorDashLogo,
};

/**
 * Detect brand from bill name
 */
function detectBrand(billName: string): string | null {
    const name = billName.toLowerCase().trim();

    // Check exact matches or includes
    for (const [keyword] of Object.entries(BRAND_LOGOS)) {
        if (name.includes(keyword)) {
            return keyword;
        }
    }

    return null;
}

/**
 * BrandLogo Component
 * Displays brand logo if detected, otherwise shows category icon
 */
export default function BrandLogo({
    billName,
    category = 'other',
    size = 32,
    fallbackColor
}: BrandLogoProps) {
    const brand = detectBrand(billName);

    // If we have a brand logo, use it
    if (brand && BRAND_LOGOS[brand]) {
        const LogoComponent = BRAND_LOGOS[brand];
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <LogoComponent width={size} height={size} />
            </View>
        );
    }

    // Fallback to category color circle with initial
    const categoryData = billCategories[category];
    const initial = billName.charAt(0).toUpperCase();
    const bgColor = fallbackColor || categoryData?.color || '#6B7280';

    return (
        <View style={[
            styles.fallback,
            {
                width: size,
                height: size,
                backgroundColor: `${bgColor}20`,
                borderColor: bgColor,
            }
        ]}>
            <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
                <Text style={{ fontSize: size * 0.5 }}>
                    {categoryData?.icon || '📦'}
                </Text>
            </View>
        </View>
    );
}

/**
 * Check if a bill has a recognizable brand logo
 */
export function hasBrandLogo(billName: string): boolean {
    return detectBrand(billName) !== null;
}

/**
 * Get mini logo for calendar (smaller size)
 */
export function MiniLogo({ billName, size = 16 }: { billName: string; size?: number }) {
    const brand = detectBrand(billName);

    if (brand && BRAND_LOGOS[brand]) {
        const LogoComponent = BRAND_LOGOS[brand];
        return <LogoComponent width={size} height={size} />;
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallback: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    iconWrapper: {
        borderRadius: 8,
        padding: 4,
    },
});
