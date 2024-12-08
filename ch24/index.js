window.addEventListener('load', ()=>{
    const sounds=document.querySelectorAll(".sound");
    const pads=document.querySelectorAll(".pads div");

    pads.forEach((pad,index) => {
        pad.addEventListener('click', ()=> {
          sounds[index].currentTime = 0;
          sounds[index].play();
        });
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js')
            .then(() => console.log("Service Worker Registered"))
            .catch(error => console.log("Service Worker Registration Failed", error));
    }
});
