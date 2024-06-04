window.adsControllerLoaded = false;
let adsVisible = false;

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    container.className = "unity-mobile";
    // Avoid draining fillrate performance on mobile devices,
    // and default/override low DPI mode on mobile browsers.
    config.devicePixelRatio = 1;
    mobileWarning.style.display = "block";
    setTimeout(() => {
        mobileWarning.style.display = "none";
    }, 5000);
}

document.onkeydown = function (e) {
    if (e.altKey || e.ctrlKey || e.key === "F1" || e.key === "F2" || e.key === "F3" || e.key === "F4") {
        e.preventDefault();
    }
}

document.onmouseup = function (e) {
    e.preventDefault();
}

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

let lockedOccured = false;
function lockChangeAlert() {
    if (!lockedOccured && document.pointerLockElement)
        lockedOccured = true;
    if (!document.pointerLockElement && lockedOccured){
        lockedOccured = false;
        window.unityInstance.SendMessage("Pause Menu", "OnCursorUnlocked");
    }
}

window.addEventListener('resize', injectAdByWindowSize);

function injectAdByWindowSize() {

}

injectAdByWindowSize();

var refreshNextTime = true;

async function showAds() {
    // while (window.cpmstarAPI === undefined) {
    //     await sleep(500)
    // }

    // document.getElementsByClassName("ad-rectangle-bottom")[0].style.display = "block";
    // document.getElementsByClassName("ad-leaderboard-bottom")[0].style.display = "block";
    // document.getElementsByClassName("ad-rectangle-upper")[0].style.display = "block";

    // if (typeof counter === 'undefined') {
    //     startCounter();
    //     resumeCounter();
    // }
    // else {
    //     resumeCounter();
    //     refresh();
    // }
}

async function hideAds() {
	// while (window.cpmstarAPI === undefined) {
    //     await sleep(500)
    // }

    document.getElementsByClassName("ad-rectangle-bottom")[0].style.display = "none";
    document.getElementsByClassName("ad-leaderboard-bottom")[0].style.display = "none";
    document.getElementsByClassName("ad-rectangle-upper")[0].style.display = "none";

    // pauseCounter();
}

function refresh() {

    //console.log("time since ads refresh = " + timeSinceRefresh + " seconds");
    //console.log("time ads visible = " + timeAdsVisible + " seconds");

    if (timeSinceRefresh <= 30 || timeAdsVisible <= 2) {
        //console.log("don't refresh");
        return;
    }

    if (document.getElementById("adRectangleBottom") != null &&
        window.getComputedStyle(document.getElementsByClassName("ad-smallscreen")[0]).display != "none") {
        cpmstarAPI({ kind: "adcmd", module: "POOL 83023", command: "refresh" });
    }

    if (document.getElementById("adLeaderboardBottom") != null &&
        window.getComputedStyle(document.getElementsByClassName("ad-largescreen")[0]).display != "none") {
        cpmstarAPI({ kind: "adcmd", module: "POOL 85420", command: "refresh" });
    }

    cpmstarAPI({ kind: "adcmd", module: "POOL 83025", command: "refresh" });

    timeSinceRefresh = 0;
    timeAdsVisible = 0;
    //console.log("refresh ads");
}

window.onfocus = function () {
    //console.log("onfocus");
    resumeCounter();
    refresh();
};

window.onblur = function () {
    //console.log("onblur");
    pauseCounter();
};

var timeSinceRefresh = 0;
var timeAdsVisible = 0;
var counter;

function startCounter() {
    timeSinceRefresh++;
    if (adsVisible)
        timeAdsVisible++;

    counter = setTimeout(function () {
        startCounter();
    }, 1000);
}

function resumeCounter() {
    adsVisible = true;
}

function pauseCounter() {
    adsVisible = false;
}