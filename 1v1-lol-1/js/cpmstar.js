//init the interstitial 
window.adsLoaded = true;
let iAd;

async function initAds() {
    while (window.cpmstarAPI === undefined) {
        await sleep(500)
    }
    window.cpmstarAPI(function (api) {
        //console.log("Setting iAD")
        iAd = new api.game.InterstitialView("interstitial");
        iAd.load();
        iAd.addEventListener("ad_opened", function (e) {
            iAdPause(); //Pause the game when ad is open
        });

        iAd.addEventListener("ad_closed", function (e) {
            setTimeout(function () {
                iAdUnpause(); //Unpause when ad closed.
            }, 700);
            iAd.load(); //Preload another ad.
        });
    });
}

function iAdPause() {

}
function iAdUnpause() {
    unityAdFinishedCallback("true")
}


window.requestNewAd = () => {
    //console.log("requested AD")
    //console.log(iAd)
    if (iAd && iAd.isLoaded()) {
        iAd.show(); //Show loaded ad   
    }
    else {
        if (iAd) iAd.load(); //If no ad available, load another      
        unityAdFinishedCallback("false")
    }
}

// This function calls Unity to tell the ad finished
function unityAdFinishedCallback(state) {
    try {
        if (window.unityInstance) {
            window.unityInstance.SendMessage('PersistantObjects', 'OnWebCallback', state);
        }
    }
    catch (error) {
        console.log(error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}