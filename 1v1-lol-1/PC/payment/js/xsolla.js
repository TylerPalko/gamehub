function xsollaPurchase(token, isSandbox, onPurchaseComplete) {
    let sandboxState = isSandbox > 0;

    let options = {
        access_token: token,
        sandbox: sandboxState
    }

    let s = document.createElement('script');
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://cdn.xsolla.net/embed/paystation/1.2.3/widget.min.js";
    s.addEventListener('load', function (e) {
        XPayStationWidget.init(options);
        XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS_DONE, function (event, data) {
            onPurchaseComplete("true");
        });
        XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS_TROUBLED, function (event, data) {
            onPurchaseComplete("false");
        });
        XPayStationWidget.on(XPayStationWidget.eventTypes.CLOSE, function (event, data) {
            onPurchaseComplete("false");
        });

        XPayStationWidget.open()

    }, false);
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(s);
}