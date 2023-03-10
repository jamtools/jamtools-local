import Audic from 'audic';

const audic = new Audic('./audio.mp3');

setTimeout(async () => {
    // await audic.play();

    audic.addEventListener('ended', () => {
        audic.destroy();
    });

    setInterval(() => {
        console.log('play');
        audic.play();
    }, 1000);

    setTimeout(() => {
        setInterval(() => {
            console.log('pause');
            audic.pause();
        }, 1000);
    }, 500);
    // }), 1000), 500);
});
