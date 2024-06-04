let dependencyUrls = []
const maxLoadTimesTrys = 4;

//Main Libraries
dependencyUrls.push("https://www.googletagmanager.com/gtag/js?id=UA-118283086-6", "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
//Ads Libraries
dependencyUrls.push("js/ads-prebid.js", "js/IronSourceRV.js", "js/cpmstar.js", "js/adsController.js");
//Firebase/Google Libraries
dependencyUrls.push("js/googleAnalytics.js", "js/firebase.js", "js/login.js", "js/firebase-config.js", "js/firestore.js")
//Game Libraries
dependencyUrls.push("js/unityUrls.js", "js/unityGame.js", "js/mobileRedirect.js", "js/fullscreen.js")
//etc. Libraries
dependencyUrls.push("js/windowResize.js", "js/adblockManager.js", "js/macUserAgent.js", "js/visibilityChangeListener.js", "PC/payment/js/xsolla.js")

dynamicallyLoadScripts();

async function dynamicallyLoadScripts() {
    for (let i = 0; i < dependencyUrls.length; i++) {
        let url = dependencyUrls[i];
        let script = document.createElement("script");
        script.src = url;

        document.head.appendChild(script);
    }

    let trys = 0;
    while (window.loadedUrls === undefined || window.firebaseLoaded === undefined || window.adsLoaded === undefined
    || window.gameScriptLoaded === undefined || window.configInit === undefined || window.adsControllerLoaded === undefined) {
        await sleep(500)
        trys++;
        if(trys >= maxLoadTimesTrys) {
            break;
        }
    }
    
    initAds();
    loadGame();
    initFirebaseLibraries();
    fixMacUserAgent();
}

function loadGame() {
    let gameLoader = document.createElement("script")
    gameLoader.src = getGameLoaderUrl();
    gameLoader.id = "unity-loader"
    gameLoader.onload = function () {
        showGame();
    };

    let gameLoadDiv = document.getElementById("unity-loader-div");
    gameLoadDiv.innerHTML = "";
    gameLoadDiv.appendChild(gameLoader);
}

function initFirebaseLibraries() {
    initializeFireBase();
    initRemoteConfig();
}

function onUnityReady() {
    checkAdBlock();
    sendConfig();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}