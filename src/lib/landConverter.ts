export const STANDARD_UNITS: Record<string, number> = {
    "sq_ft": 0.092903,
    "sq_m": 1,
    "sq_yd": 0.836127,
    "acre": 4046.86,
    "hectare": 10000,
    "guntha": 101.171,
    "cent": 40.4686,
    "ground": 222.967,
    "kanal": 505.857,
    "marla": 25.2929,
};

export const STATE_DATA: Record<string, { name: string; label: string; units: Record<string, number> }> = {
    "RJ": {
        name: "RJ",
        label: "Rajasthan",
        units: {
            "bigha": 2529.29, // Pucca Bigha (Standard in many parts)
            "bigha_kachha": 1618.74, // Kachha Bigha (varies, approx 1000-1700 sq m)
            "biswa": 126.46, // 1/20 of Pucca Bigha
            "biswansi": 6.323, // 1/20 of Biswa
        }
    },
    "MH": {
        name: "MH",
        label: "Maharashtra",
        units: {
            "guntha": 101.17,
            "bigha": 2529.29,
        }
    },
    "UP": {
        name: "UP",
        label: "Uttar Pradesh",
        units: {
            "bigha": 2529.29,
            "biswa": 126.46,
            "biswansi": 6.323,
        }
    },
    "GJ": {
        name: "GJ",
        label: "Gujarat",
        units: {
            "bigha": 2391.98, // Approx 17565 sq ft
            "vigha": 2391.98,
            "guntha": 101.17,
        }
    },
    "STD": {
        name: "STD",
        label: "Standard (Generic)",
        units: {}
    }
};

export const UNIT_LABELS: Record<string, string> = {
    "sq_ft": "Square Feet",
    "sq_m": "Square Meters",
    "sq_yd": "Square Yards",
    "acre": "Acres",
    "hectare": "Hectares",
    "bigha": "Bigha (Pucca)",
    "bigha_kachha": "Bigha (Kachha)",
    "vigha": "Vigha",
    "biswa": "Biswa",
    "biswansi": "Biswansi",
    "guntha": "Guntha",
    "cent": "Cent",
    "ground": "Ground",
    "kanal": "Kanal",
    "marla": "Marla",
};

export const getConversionFactor = (unit: string, state: string): number => {
    // Check state specific first
    if (STATE_DATA[state]?.units[unit]) {
        return STATE_DATA[state].units[unit];
    }
    // Fallback to standard
    if (STANDARD_UNITS[unit]) {
        return STANDARD_UNITS[unit];
    }
    // Default to 1 if unknown (shouldn't happen if configured correctly)
    return 1;
};

export const convertLandUnit = (
    value: number,
    fromUnit: string,
    toUnit: string,
    state: string
): number => {
    if (fromUnit === toUnit) return value;

    const fromFactor = getConversionFactor(fromUnit, state);
    const toFactor = getConversionFactor(toUnit, state);

    // Convert to square meters first, then to target unit
    const sqMeters = value * fromFactor;
    const result = sqMeters / toFactor;

    return result;
};

export const formatNumber = (num: number): string => {
    if (num === 0) return "0";
    if (Math.abs(num) >= 1) {
        return num.toLocaleString("en-IN", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0,
        });
    }
    return num.toPrecision(6);
};

export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-IN");
};
