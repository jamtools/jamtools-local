import {WLEDClient} from 'wled-client';

let paletteIndex = 0;
let previousPalette = 0;
export const setRandomColor = async (wled: WLEDClient | undefined) => {
    if (!wled) {
        return;
    }

    let palette = Math.floor(wled.palettes.length * Math.random());
    if (palette === previousPalette) {
        palette = (palette + 1) % wled.palettes.length;
    }

    previousPalette = palette;
    await wled.setPalette(palette, {segmentId: [0, 1]});

    const speed = Math.floor(Math.random() * 255);
    // await wled.setEffectSpeed(speed);

    const name = wled.palettes[palette];

    paletteIndex++;
    console.log(name);
    // console.log(i, name, speed);
};

let effectIndex = 0;
let previousEffect = 0;
export const setRandomEffect = async (wled: WLEDClient | undefined) => {
    if (!wled) {
        return;
    }

    let effect = Math.floor(wled.effects.length * Math.random());
    if (effect === previousEffect) {
        effect = (effect + 1) % wled.effects.length;
    }

    previousEffect = effect;
    await wled.setEffect(effect, {segmentId: [0, 1]});

    const name = wled.effects[effect];

    effectIndex++;
    console.log(name);
    // console.log(i, name, speed);
};
