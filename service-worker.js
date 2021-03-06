importScripts('./node_modules/workbox-sw/build/importScripts/workbox-sw.dev.v2.1.2.js');

const staticAssets = [
    './',
    './index.html',
    './css/style.css',
    './js/index.js',
    './fallback.json',
    './img/fetch-dog.jpg'
];
const wb = new WorkboxSW();
wb.precache(staticAssets);

wb.router.registerRoute('https://newsapi.org/(.*)', wb.strategies.networkFirst())
wb.router.registerRoute(/.*\.(png|jpg|jpeg|gif)/, wb.strategies.cacheFirst({
    cacheName: 'news-images',
    cacheExpiration: {maxEntries: 20, maxAgeSeconds: 12 * 60 * 60},
    cacheableResponse: {statuses: [0,200]}
}))




// self.addEventListener('install', async event => {
//     const cache = await caches.open('news-static');
//     cache.addAll(staticAssets);
// });

// self.addEventListener('fetch', event => {
//     const req = event.request;
//     const url = new URL(req.url);
//     console.log(req)
//     if(url.origin === location.origin){
//         event.respondWith(cacheFirst(req));
//     } else {
//         event.respondWith(networkFirst(req))
//     }
// })

// async function cacheFirst(req){
//     const cachedResponse = await caches.match(req);
//     return cachedResponse || fetch(req);
//     fetch(req)
// }

// async function networkFirst(req){
//    const cache = await caches.open('news-dynamic');

//    try {
//         const res = await fetch(req);
//         cache.put(req, res.clone());
//         return res;
//    } catch (error) {
//         const cachedResponse = await cache.match(req)
//         return cachedResponse || await caches.match('./fallback.json')
//    }
// }


/*
self は ServiceWorkerGlobalScope というオブジェクト
*/
// self.addEventListener('install', event => {
    /*
    index.js内でSW.jsがブラウザに登録されて
    SW.jsがインストールされると InstallEvent がかえる
    event.currentTarget === self === ServiceWorkerGlobalScope
    */
    // console.log('Service Workerのinstallイベントが発生しました。')

    /*
    event.waitUntil(f) がしていること
    https://www.w3.org/TR/service-workers/#service-worker-lifetime
    W3CによるとブラウザはいつSWの処理を終了しておかしくない仕様になっている(処理するイベントが無いもしくは無限ループなどが起きたとき)
    waitUntilメソッドはブラウザにPromiseがかえされるまでには処理止めないようにする命令
    
    waitUntilメソッドのSTEP
    1. InstallEventオブジェクトのisTrustedプロパティがfalseだったら、"InvalidStateError"をかえす
    2. もし*Promiseが処理するものがPending(resolve(fullfilled)でもrejectedでもない状態)のとき、"InvalidStateError"をかえす
    3. f()がextend lifetime promisesに追加される
    4. pendingとなっているpromiseの処理をカウントする
    5. fullfilledもしくはrejectedになったf()の処理をmicrotaskにキューする(promiseの処理をdecrementしていく_
    
    *Promiseの動きおさらい
    A promise p はfullfilledである when p.then(f, r)  fires function f()
    A promise p はrejectedである when p.then(f, r)  fires function r()
    A promise p はpendginである when p.then(f, r)  nether f() or r() fires
    
    */
    // event.waitUntil(
    //     new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             resolve('success');
    //         }, 5000);
    //     })
    // );
    // event.waitUntil(
    //     new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             reject(new Error('インストール失敗'));
    //         }, 5000);
    //     })
    // );

    /*
    SWでリソースをCacheする場合はCache APIを使う必要がある
    */

    /*
    基本的なCache (installイベント内に記述)
    */
//     event.waitUntil(
//         caches.open('cache-v1')
//             .then(cache => {
//                 return cache.addAll([
//                     './',
//                     './index.html',
//                     './js/index.js',
//                     './img/mask1.svg',
//                     './img/mask3.svg',
//                     './img/mask4.svg'

//                 ])
//             })
//             .then(() => {
//                 console.log('キャッシュが完了しました')
//             })
//     )

//     event.waitUntil(
//         caches.open('cache-v2')
//             .then(cache => {
//                 return cache.addAll([
//                     './',
//                     './index.html',
//                     './js/index.js',
//                     './img/mask2.svg',
//                 ])
//             })
//     )
// })

/*
応用Cache
Cacheしたソースがある場合、
1. ブラウザからのリクエストをキャッチする
2. キャッチしたリクエストと対応するキャッシュがあるか調べる
 2-1. ある場合はそのキャッシュを返す
 2-2. ない場合は通常どおりリクエストを続けてもらう
*/

// 1. ブラウザからのリクエストをキャッチする
/*
ブラウザからのリクエストをキャッチするには、fetchを使う
*/
// self.addEventListener('fetch', event => {
    //1
    //ブラウザのリクエストを横取りする
    //リクエストに対して何もしない場合は単にreturnするだけでよい
    //毎リクエストごとに"event"がかえる
    // console.log(event.request.url)
    // return;

    //2 HTMLページコンテンツをHackしてカスタムコンテンツで返す場合
    // event.respondWith(new Response('Hello'));
    //event === FetchEvent は respondWith(response)メソッドを持ち
    //resolve時にResponseオブジェクト取得できるPromiseオブジェクトを受け取る

    //3
    // CacheStorage.match(request)
    // Offline時用に頁を表示する場合にはcache.addAllで;'index.html'と'/'もcacheさせる必要がある
    // event.respondWith(
    //     caches.match(event.request)
    //         .then(response => {
    //             console.log('↓Cached Contents')
    //             console.log(response)
    //             if (response) {
    //                 return response;
    //             }
    //             return fetch(event.request);
    //         })
    // )


// });


// const currentCacheNames = 'cache-v2';

// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             // caches.delete()が返すPromiseオブジェクトの配列をつくる
//             // Promise.all()でラップして返すため
//             const promises = cacheNames.map(cacheName => {
//                 if (currentCacheNames.indexOf(cacheName) === -1) {
//                     return caches.delete(cacheName);
//                 }
//             });
//             return Promise.all(promises);
//         })
//     );
// });


/* Browserロード時に、installされたservice workerのファイルサイズが
1 byte でもちがうと "waiting to activate"の状態になる
これをクリアするには"skipWaiting"か別タブで開くしか無い
*/