import mongoose, { Document, Schema } from 'mongoose';

export interface IColorPreset {
    name: string;
    hue: number;
    color: string; // oklch color string
}

export interface ITheme extends Document {
    // Active theme settings
    activeColorHue: number;
    darkMode: boolean;

    // Typography
    primaryFont: string;
    headingFont: string;
    baseFontSize: string;

    // Border radius
    borderRadius: number; // in rem

    // Color presets (stored as array)
    colorPresets: IColorPreset[];

    // Metadata
    isActive: boolean; // Only one theme should be active
    createdAt: Date;
    updatedAt: Date;
}

const ColorPresetSchema = new Schema<IColorPreset>(
    {
        name: { type: String, required: true, trim: true },
        hue: { type: Number, required: true, min: 0, max: 360 },
        color: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const themeSchema = new Schema<ITheme>(
    {
        activeColorHue: {
            type: Number,
            required: true,
            default: 155,
            min: 0,
            max: 360,
        },
        darkMode: {
            type: Boolean,
            default: false,
        },
        primaryFont: {
            type: String,
            default: 'Inter',
            trim: true,
        },
        headingFont: {
            type: String,
            default: 'Inter',
            trim: true,
        },
        baseFontSize: {
            type: String,
            default: '16px',
            trim: true,
        },
        borderRadius: {
            type: Number,
            default: 0.625,
            min: 0,
        },
        colorPresets: {
            type: [ColorPresetSchema],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index to ensure only one active theme
themeSchema.index({ isActive: 1 });

export const Theme = mongoose.model<ITheme>('Theme', themeSchema);

