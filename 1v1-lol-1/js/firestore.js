const cache = {};
let callbackId = 0;

// This is being called directly from unity.
function getFirestoreListener(collection, documentId, successCallback, errorCallback) {
    callbackId++;
    const id = callbackId; // capture value
    const unsubscribe = firebase.firestore().collection(collection).doc(documentId).onSnapshot(doc => {
        if (doc.exists)
            successCallback([id, JSON.stringify(doc.data())]);
    }, error => {
        errorCallback(error.message);
    });
    
    cache[id] = unsubscribe;
    return id;
}

// This is being called directly from unity.
function detachFirestoreListener(id) {
    if (cache[id] !== undefined) {
        cache[id]();
        delete cache[id];
    }
}