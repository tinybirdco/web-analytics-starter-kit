(function(){
    const timezones = {"Asia/Barnaul":"RU","Africa/Nouakchott":"MR","Africa/Lusaka":"ZM","Asia/Pyongyang":"KP","Europe/Bratislava":"SK","America/Belize":"BZ","America/Maceio":"BR","Pacific/Chuuk":"FM","Indian/Comoro":"KM","Pacific/Palau":"PW","Asia/Jakarta":"ID","Africa/Windhoek":"NA","America/Chihuahua":"MX","America/Nome":"US","Africa/Mbabane":"SZ","Africa/Porto-Novo":"BJ","Europe/San_Marino":"SM","Pacific/Fakaofo":"TK","America/Denver":"US","Europe/Belgrade":"RS","America/Indiana/Tell_City":"US","America/Fortaleza":"BR","America/Halifax":"CA","Europe/Bucharest":"RO","America/Indiana/Petersburg":"US","Europe/Kirov":"RU","Europe/Athens":"GR","America/Argentina/Ushuaia":"AR","Europe/Monaco":"MC","Europe/Vilnius":"LT","Europe/Copenhagen":"DK","Pacific/Kanton":"KI","America/Caracas":"VE","Asia/Almaty":"KZ","Europe/Paris":"FR","Africa/Blantyre":"MW","Asia/Muscat":"OM","America/North_Dakota/Beulah":"US","America/Matamoros":"MX","Asia/Irkutsk":"RU","America/Costa_Rica":"CR","America/Araguaina":"BR","Atlantic/Canary":"ES","America/Santo_Domingo":"DO","America/Vancouver":"CA","Africa/Addis_Ababa":"ET","Africa/Accra":"GH","Pacific/Kwajalein":"MH","Asia/Baghdad":"IQ","Australia/Adelaide":"AU","Australia/Hobart":"AU","America/Guayaquil":"EC","America/Argentina/Tucuman":"AR","Australia/Lindeman":"AU","America/New_York":"US","Pacific/Fiji":"FJ","America/Antigua":"AG","Africa/Casablanca":"MA","America/Paramaribo":"SR","Africa/Cairo":"EG","America/Cayenne":"GF","America/Detroit":"US","Antarctica/Syowa":"AQ","Africa/Douala":"CM","America/Argentina/La_Rioja":"AR","Africa/Lagos":"NG","America/St_Barthelemy":"BL","Asia/Nicosia":"CY","Asia/Macau":"MO","Europe/Riga":"LV","Asia/Ashgabat":"TM","Indian/Antananarivo":"MG","America/Argentina/San_Juan":"AR","Asia/Aden":"YE","Asia/Tomsk":"RU","America/Asuncion":"PY","Pacific/Bougainville":"PG","Asia/Vientiane":"LA","America/Mazatlan":"MX","Africa/Luanda":"AO","Europe/Oslo":"NO","Africa/Kinshasa":"CD","Europe/Warsaw":"PL","America/Grand_Turk":"TC","Asia/Seoul":"KR","Africa/Tripoli":"LY","America/St_Thomas":"VI","Asia/Kathmandu":"NP","Pacific/Pitcairn":"PN","Pacific/Nauru":"NR","America/Curacao":"CW","Asia/Kabul":"AF","Pacific/Tongatapu":"TO","Europe/Simferopol":"UA","Asia/Ust-Nera":"RU","Africa/Mogadishu":"SO","Indian/Mayotte":"YT","Pacific/Niue":"NU","America/Thunder_Bay":"CA","Atlantic/Azores":"PT","Pacific/Gambier":"PF","Europe/Stockholm":"SE","Africa/Libreville":"GA","America/Punta_Arenas":"CL","America/Guatemala":"GT","America/Noronha":"BR","Europe/Helsinki":"FI","Asia/Gaza":"PS","Pacific/Kosrae":"FM","America/Aruba":"AW","America/Nassau":"BS","Asia/Choibalsan":"MN","America/Winnipeg":"CA","America/Anguilla":"AI","Asia/Thimphu":"BT","Asia/Beirut":"LB","Atlantic/Faroe":"FO","Europe/Berlin":"DE","Europe/Amsterdam":"NL","Pacific/Honolulu":"US","America/Regina":"CA","America/Scoresbysund":"GL","Europe/Vienna":"AT","Europe/Tirane":"AL","Africa/El_Aaiun":"EH","America/Creston":"CA","Asia/Qostanay":"KZ","Asia/Ho_Chi_Minh":"VN","Europe/Samara":"RU","Europe/Rome":"IT","Australia/Eucla":"AU","America/El_Salvador":"SV","America/Chicago":"US","Africa/Abidjan":"CI","Asia/Kamchatka":"RU","Pacific/Tarawa":"KI","America/Santiago":"CL","America/Bahia":"BR","Indian/Christmas":"CX","Asia/Atyrau":"KZ","Asia/Dushanbe":"TJ","Europe/Ulyanovsk":"RU","America/Yellowknife":"CA","America/Recife":"BR","Australia/Sydney":"AU","America/Fort_Nelson":"CA","Pacific/Efate":"VU","Europe/Saratov":"RU","Africa/Banjul":"GM","Asia/Omsk":"RU","Europe/Ljubljana":"SI","Europe/Budapest":"HU","Europe/Astrakhan":"RU","America/Argentina/Buenos_Aires":"AR","Pacific/Chatham":"NZ","America/Argentina/Salta":"AR","Africa/Niamey":"NE","Asia/Pontianak":"ID","Indian/Reunion":"RE","Asia/Hong_Kong":"HK","Antarctica/McMurdo":"AQ","Africa/Malabo":"GQ","America/Los_Angeles":"US","America/Argentina/Cordoba":"AR","Pacific/Pohnpei":"FM","America/Tijuana":"MX","America/Campo_Grande":"BR","America/Dawson_Creek":"CA","Asia/Novosibirsk":"RU","Pacific/Pago_Pago":"AS","Asia/Jerusalem":"IL","Europe/Sarajevo":"BA","Africa/Freetown":"SL","Asia/Yekaterinburg":"RU","America/Juneau":"US","Africa/Ouagadougou":"BF","Africa/Monrovia":"LR","Europe/Kiev":"UA","America/Argentina/San_Luis":"AR","Asia/Tokyo":"JP","Asia/Qatar":"QA","America/La_Paz":"BO","America/Bogota":"CO","America/Thule":"GL","Asia/Manila":"PH","Asia/Hovd":"MN","Asia/Tehran":"IR","Atlantic/Madeira":"PT","America/Metlakatla":"US","Europe/Vatican":"VA","Asia/Bishkek":"KG","Asia/Dili":"TL","Antarctica/Palmer":"AQ","Atlantic/Cape_Verde":"CV","Indian/Chagos":"IO","America/Kentucky/Monticello":"US","Africa/Algiers":"DZ","Africa/Maseru":"LS","Asia/Kuala_Lumpur":"MY","Africa/Khartoum":"SD","America/Argentina/Rio_Gallegos":"AR","America/Blanc-Sablon":"CA","Africa/Maputo":"MZ","America/Tortola":"VG","Atlantic/Bermuda":"BM","America/Argentina/Catamarca":"AR","America/Cayman":"KY","America/Puerto_Rico":"PR","Pacific/Majuro":"MH","Europe/Busingen":"DE","Pacific/Midway":"UM","Indian/Cocos":"CC","Asia/Singapore":"SG","America/Boise":"US","America/Nuuk":"GL","America/Goose_Bay":"CA","Australia/Broken_Hill":"AU","Africa/Dar_es_Salaam":"TZ","Africa/Asmara":"ER","Asia/Samarkand":"UZ","Asia/Tbilisi":"GE","America/Argentina/Jujuy":"AR","America/Indiana/Winamac":"US","America/Porto_Velho":"BR","Asia/Magadan":"RU","Europe/Zaporozhye":"UA","Antarctica/Casey":"AQ","Asia/Shanghai":"CN","Pacific/Norfolk":"NF","Europe/Guernsey":"GG","Australia/Brisbane":"AU","Antarctica/DumontDUrville":"AQ","America/Havana":"CU","America/Atikokan":"CA","America/Mexico_City":"MX","America/Rankin_Inlet":"CA","America/Cuiaba":"BR","America/Resolute":"CA","Africa/Ceuta":"ES","Arctic/Longyearbyen":"SJ","Pacific/Guam":"GU","Asia/Damascus":"SY","Asia/Colombo":"LK","Asia/Yerevan":"AM","America/Montserrat":"MS","America/Belem":"BR","Europe/Kaliningrad":"RU","Atlantic/South_Georgia":"GS","Asia/Tashkent":"UZ","Asia/Kolkata":"IN","America/St_Johns":"CA","Asia/Srednekolymsk":"RU","Asia/Yakutsk":"RU","Europe/Prague":"CZ","Africa/Djibouti":"DJ","Asia/Dubai":"AE","Europe/Uzhgorod":"UA","America/Edmonton":"CA","Asia/Famagusta":"CY","America/Indiana/Knox":"US","Asia/Hebron":"PS","Asia/Taipei":"TW","Europe/London":"GB","Africa/Dakar":"SN","Australia/Darwin":"AU","America/Glace_Bay":"CA","Antarctica/Vostok":"AQ","America/Indiana/Vincennes":"US","America/Nipigon":"CA","Asia/Kuwait":"KW","Pacific/Guadalcanal":"SB","America/Toronto":"CA","Africa/Gaborone":"BW","Africa/Bujumbura":"BI","Africa/Lubumbashi":"CD","America/Merida":"MX","America/Marigot":"MF","Europe/Zagreb":"HR","Pacific/Easter":"CL","America/Santarem":"BR","Pacific/Noumea":"NC","America/Sitka":"US","Atlantic/Stanley":"FK","Pacific/Funafuti":"TV","America/Iqaluit":"CA","America/Rainy_River":"CA","America/Anchorage":"US","America/Lima":"PE","Asia/Baku":"AZ","America/Indiana/Vevay":"US","Asia/Ulaanbaatar":"MN","America/Managua":"NI","Asia/Krasnoyarsk":"RU","Asia/Qyzylorda":"KZ","America/Eirunepe":"BR","Europe/Podgorica":"ME","Europe/Chisinau":"MD","Europe/Mariehamn":"AX","Europe/Volgograd":"RU","Africa/Nairobi":"KE","Europe/Isle_of_Man":"IM","America/Menominee":"US","Africa/Harare":"ZW","Asia/Anadyr":"RU","America/Moncton":"CA","Indian/Maldives":"MV","America/Whitehorse":"CA","Antarctica/Mawson":"AQ","Europe/Madrid":"ES","America/Argentina/Mendoza":"AR","America/Manaus":"BR","Africa/Bangui":"CF","Indian/Mauritius":"MU","Africa/Tunis":"TN","Australia/Lord_Howe":"AU","America/Kentucky/Louisville":"US","America/North_Dakota/Center":"US","Asia/Novokuznetsk":"RU","Asia/Makassar":"ID","America/Port_of_Spain":"TT","America/Bahia_Banderas":"MX","Pacific/Auckland":"NZ","America/Sao_Paulo":"BR","Asia/Dhaka":"BD","America/Pangnirtung":"CA","Europe/Dublin":"IE","Asia/Brunei":"BN","Africa/Brazzaville":"CG","America/Montevideo":"UY","America/Jamaica":"JM","America/Indiana/Indianapolis":"US","America/Kralendijk":"BQ","Europe/Gibraltar":"GI","Pacific/Marquesas":"PF","Pacific/Apia":"WS","Europe/Jersey":"JE","America/Phoenix":"US","Africa/Ndjamena":"TD","Asia/Karachi":"PK","Africa/Kampala":"UG","Asia/Sakhalin":"RU","America/Martinique":"MQ","Europe/Moscow":"RU","Africa/Conakry":"GN","America/Barbados":"BB","Africa/Lome":"TG","America/Ojinaga":"MX","America/Tegucigalpa":"HN","Asia/Bangkok":"TH","Africa/Johannesburg":"ZA","Europe/Vaduz":"LI","Africa/Sao_Tome":"ST","America/Cambridge_Bay":"CA","America/Lower_Princes":"SX","America/Miquelon":"PM","America/St_Kitts":"KN","Australia/Melbourne":"AU","Europe/Minsk":"BY","Asia/Vladivostok":"RU","Europe/Sofia":"BG","Antarctica/Davis":"AQ","Pacific/Galapagos":"EC","America/North_Dakota/New_Salem":"US","Asia/Amman":"JO","Pacific/Wallis":"WF","America/Hermosillo":"MX","Pacific/Kiritimati":"KI","Antarctica/Macquarie":"AU","America/Guyana":"GY","Asia/Riyadh":"SA","Pacific/Tahiti":"PF","America/St_Vincent":"VC","America/Cancun":"MX","America/Grenada":"GD","Pacific/Wake":"UM","America/Dawson":"CA","Europe/Brussels":"BE","Indian/Kerguelen":"TF","America/Yakutat":"US","Indian/Mahe":"SC","Atlantic/Reykjavik":"IS","America/Panama":"PA","America/Guadeloupe":"GP","Europe/Malta":"MT","Antarctica/Troll":"AQ","Asia/Jayapura":"ID","Asia/Bahrain":"BH","Asia/Chita":"RU","Europe/Tallinn":"EE","Asia/Khandyga":"RU","America/Rio_Branco":"BR","Atlantic/St_Helena":"SH","Africa/Juba":"SS","America/Adak":"US","Pacific/Saipan":"MP","America/St_Lucia":"LC","America/Inuvik":"CA","Europe/Luxembourg":"LU","Africa/Bissau":"GW","Asia/Oral":"KZ","America/Boa_Vista":"BR","Europe/Skopje":"MK","America/Port-au-Prince":"HT","Pacific/Port_Moresby":"PG","Europe/Andorra":"AD","America/Indiana/Marengo":"US","Africa/Kigali":"RW","Africa/Bamako":"ML","America/Dominica":"DM","Asia/Aqtobe":"KZ","Europe/Istanbul":"TR","Pacific/Rarotonga":"CK","America/Danmarkshavn":"GL","Europe/Zurich":"CH","Asia/Yangon":"MM","America/Monterrey":"MX","Europe/Lisbon":"PT","Asia/Kuching":"MY","Antarctica/Rothera":"AQ","Australia/Perth":"AU","Asia/Phnom_Penh":"KH","America/Swift_Current":"CA","Asia/Aqtau":"KZ","Asia/Urumqi":"CN","Asia/Calcutta":"IN"};
  const STORAGE_KEY = 'session-id'
  let DATASOURCE = 'analytics_events'
  const storageMethods = {
    cookie: 'cookie',
    localStorage: 'localStorage',
    sessionStorage: 'sessionStorage',
  }
  let STORAGE_METHOD = storageMethods.cookie
  let globalAttributes = {}
  let stringifyPayload = true

  let proxy, proxyUrl, token, host, domain
  if (document.currentScript) {
    host = document.currentScript.getAttribute('data-host')
    proxy = document.currentScript.getAttribute('data-proxy')
    proxyUrl = document.currentScript.getAttribute('data-proxy-url')
    token = document.currentScript.getAttribute('data-token')
    domain = document.currentScript.getAttribute('data-domain')
    
    // Check if both proxy and proxyUrl are specified
    if (proxy && proxyUrl) {
      console.error('Error: Both data-proxy and data-proxy-url are specified. Please use only one of them.')
      throw new Error('Both data-proxy and data-proxy-url are specified. Please use only one of them.')
    }
    DATASOURCE =
      document.currentScript.getAttribute('data-datasource') || DATASOURCE
    STORAGE_METHOD =
      document.currentScript.getAttribute('data-storage') || STORAGE_METHOD
    stringifyPayload = document.currentScript.getAttribute('data-stringify-payload') !== 'false'
    for (const attr of document.currentScript.attributes) {
      if (attr.name.startsWith('tb_')) {
        globalAttributes[attr.name.slice(3)] = attr.value
      }
    }
  }

  var webVitals = null;
  if (document.currentScript && document.currentScript.getAttribute('web-vitals') === 'true') {
    //https://unpkg.com/web-vitals@5/dist/web-vitals.iife.js
    webVitals=function(e){"use strict";var n,t,r,i,o,a=-1,c=function(e){addEventListener("pageshow",(function(n){n.persisted&&(a=n.timeStamp,e(n))}),!0)},u=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},s=function(){var e=u();return e&&e.activationStart||0},f=function(e,n){var t=u(),r="navigate";a>=0?r="back-forward-cache":t&&(document.prerendering||s()>0?r="prerender":document.wasDiscarded?r="restore":t.type&&(r=t.type.replace(/_/g,"-")));return{name:e,value:void 0===n?-1:n,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},d=function(e,n,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver((function(e){Promise.resolve().then((function(){n(e.getEntries())}))}));return r.observe(Object.assign({type:e,buffered:!0},t||{})),r}}catch(e){}},l=function(e,n,t,r){var i,o;return function(a){n.value>=0&&(a||r)&&((o=n.value-(i||0))||void 0===i)&&(i=n.value,n.delta=o,n.rating=function(e,n){return e>n[1]?"poor":e>n[0]?"needs-improvement":"good"}(n.value,t),e(n))}},v=function(e){requestAnimationFrame((function(){return requestAnimationFrame((function(){return e()}))}))},p=function(e){var n=function(n){"pagehide"!==n.type&&"hidden"!==document.visibilityState||e(n)};addEventListener("visibilitychange",n,!0),addEventListener("pagehide",n,!0)},m=function(e){var n=!1;return function(t){n||(e(t),n=!0)}},h=-1,g=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},T=function(e){"hidden"===document.visibilityState&&h>-1&&(h="visibilitychange"===e.type?e.timeStamp:0,E())},y=function(){addEventListener("visibilitychange",T,!0),addEventListener("prerenderingchange",T,!0)},E=function(){removeEventListener("visibilitychange",T,!0),removeEventListener("prerenderingchange",T,!0)},C=function(){return h<0&&(h=g(),y(),c((function(){setTimeout((function(){h=g(),y()}),0)}))),{get firstHiddenTime(){return h}}},L=function(e){document.prerendering?addEventListener("prerenderingchange",(function(){return e()}),!0):e()},w=[1800,3e3],S=function(e,n){n=n||{},L((function(){var t,r=C(),i=f("FCP"),o=d("paint",(function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(o.disconnect(),e.startTime<r.firstHiddenTime&&(i.value=Math.max(e.startTime-s(),0),i.entries.push(e),t(!0)))}))}));o&&(t=l(e,i,w,n.reportAllChanges),c((function(r){i=f("FCP"),t=l(e,i,w,n.reportAllChanges),v((function(){i.value=performance.now()-r.timeStamp,t(!0)}))})))}))},b=[.1,.25],P=function(e,n){n=n||{},S(m((function(){var t,r=f("CLS",0),i=0,o=[],a=function(e){e.forEach((function(e){if(!e.hadRecentInput){var n=o[0],t=o[o.length-1];i&&e.startTime-t.startTime<1e3&&e.startTime-n.startTime<5e3?(i+=e.value,o.push(e)):(i=e.value,o=[e])}})),i>r.value&&(r.value=i,r.entries=o,t())},u=d("layout-shift",a);u&&(t=l(e,r,b,n.reportAllChanges),p((function(){a(u.takeRecords()),t(!0)})),c((function(){i=0,r=f("CLS",0),t=l(e,r,b,n.reportAllChanges),v((function(){return t()}))})),setTimeout(t,0))})))},I={passive:!0,capture:!0},F=new Date,A=function(e,i){n||(n=i,t=e,r=new Date,k(removeEventListener),D())},D=function(){if(t>=0&&t<r-F){var e={entryType:"first-input",name:n.type,target:n.target,cancelable:n.cancelable,startTime:n.timeStamp,processingStart:n.timeStamp+t};i.forEach((function(n){n(e)})),i=[]}},M=function(e){if(e.cancelable){var n=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,n){var t=function(){A(e,n),i()},r=function(){i()},i=function(){removeEventListener("pointerup",t,I),removeEventListener("pointercancel",r,I)};addEventListener("pointerup",t,I),addEventListener("pointercancel",r,I)}(n,e):A(n,e)}},k=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(n){return e(n,M,I)}))},B=[100,300],x=function(e,r){r=r||{},L((function(){var o,a=C(),u=f("FID"),s=function(e){e.startTime<a.firstHiddenTime&&(u.value=e.processingStart-e.startTime,u.entries.push(e),o(!0))},v=function(e){e.forEach(s)},h=d("first-input",v);o=l(e,u,B,r.reportAllChanges),h&&p(m((function(){v(h.takeRecords()),h.disconnect()}))),h&&c((function(){var a;u=f("FID"),o=l(e,u,B,r.reportAllChanges),i=[],t=-1,n=null,k(addEventListener),a=s,i.push(a),D()}))}))},N=0,R=1/0,H=0,O=function(e){e.forEach((function(e){e.interactionId&&(R=Math.min(R,e.interactionId),H=Math.max(H,e.interactionId),N=H?(H-R)/7+1:0)}))},q=function(){return o?N:performance.interactionCount||0},j=function(){"interactionCount"in performance||o||(o=d("event",O,{type:"event",buffered:!0,durationThreshold:0}))},V=[200,500],_=0,z=function(){return q()-_},G=[],J={},K=function(e){var n=G[G.length-1],t=J[e.interactionId];if(t||G.length<10||e.duration>n.latency){if(t)t.entries.push(e),t.latency=Math.max(t.latency,e.duration);else{var r={id:e.interactionId,latency:e.duration,entries:[e]};J[r.id]=r,G.push(r)}G.sort((function(e,n){return n.latency-e.latency})),G.splice(10).forEach((function(e){delete J[e.id]}))}},Q=function(e,n){n=n||{},L((function(){var t;j();var r,i=f("INP"),o=function(e){e.forEach((function(e){(e.interactionId&&K(e),"first-input"===e.entryType)&&(!G.some((function(n){return n.entries.some((function(n){return e.duration===n.duration&&e.startTime===n.startTime}))}))&&K(e))}));var n,t=(n=Math.min(G.length-1,Math.floor(z()/50)),G[n]);t&&t.latency!==i.value&&(i.value=t.latency,i.entries=t.entries,r())},a=d("event",o,{durationThreshold:null!==(t=n.durationThreshold)&&void 0!==t?t:40});r=l(e,i,V,n.reportAllChanges),a&&("PerformanceEventTiming"in window&&"interactionId"in PerformanceEventTiming.prototype&&a.observe({type:"first-input",buffered:!0}),p((function(){o(a.takeRecords()),i.value<0&&z()>0&&(i.value=0,i.entries=[]),r(!0)})),c((function(){G=[],_=q(),i=f("INP"),r=l(e,i,V,n.reportAllChanges)})))}))},U=[2500,4e3],W={},X=function(e,n){n=n||{},L((function(){var t,r=C(),i=f("LCP"),o=function(e){var n=e[e.length-1];n&&n.startTime<r.firstHiddenTime&&(i.value=Math.max(n.startTime-s(),0),i.entries=[n],t())},a=d("largest-contentful-paint",o);if(a){t=l(e,i,U,n.reportAllChanges);var u=m((function(){W[i.id]||(o(a.takeRecords()),a.disconnect(),W[i.id]=!0,t(!0))}));["keydown","click"].forEach((function(e){addEventListener(e,(function(){return setTimeout(u,0)}),!0)})),p(u),c((function(r){i=f("LCP"),t=l(e,i,U,n.reportAllChanges),v((function(){i.value=performance.now()-r.timeStamp,W[i.id]=!0,t(!0)}))}))}}))},Y=[800,1800],Z=function e(n){document.prerendering?L((function(){return e(n)})):"complete"!==document.readyState?addEventListener("load",(function(){return e(n)}),!0):setTimeout(n,0)},$=function(e,n){n=n||{};var t=f("TTFB"),r=l(e,t,Y,n.reportAllChanges);Z((function(){var i=u();if(i){var o=i.responseStart;if(o<=0||o>performance.now())return;t.value=Math.max(o-s(),0),t.entries=[i],r(!0),c((function(){t=f("TTFB",0),(r=l(e,t,Y,n.reportAllChanges))(!0)}))}}))};return e.CLSThresholds=b,e.FCPThresholds=w,e.FIDThresholds=B,e.INPThresholds=V,e.LCPThresholds=U,e.TTFBThresholds=Y,e.getCLS=P,e.getFCP=S,e.getFID=x,e.getINP=Q,e.getLCP=X,e.getTTFB=$,e.onCLS=P,e.onFCP=S,e.onFID=x,e.onINP=Q,e.onLCP=X,e.onTTFB=$,e}({});
  }

  /**
   * Generate uuid to identify the session. Random, not data-derived
   */
  function _uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  }

  function _getSessionIdFromCookie() {
    let cookie = {}
    document.cookie.split(';').forEach(function (el) {
      let [key, value] = el.split('=')
      cookie[key.trim()] = value
    })
    return cookie[STORAGE_KEY]
  }

  function _getSessionId() {
    if (
      [storageMethods.localStorage, storageMethods.sessionStorage].includes(
        STORAGE_METHOD
      )
    ) {
      const storage =
        STORAGE_METHOD === storageMethods.localStorage
          ? localStorage
          : sessionStorage
      const serializedItem = storage.getItem(STORAGE_KEY)

      if (!serializedItem) {
        return null
      }

      let item = null;

      try {
        item = JSON.parse(serializedItem)
      } catch (error) {
        return null
      }

      if(typeof item !== 'object' || item === null) {
        return null
      }

      const now = new Date()

      if (now.getTime() > item.expiry) {
        storage.removeItem(STORAGE_KEY)
        return null
      }

      return item.value
    }

    return _getSessionIdFromCookie()
  }

  function _setSessionIdFromCookie(sessionId) {
    let cookieValue = `${STORAGE_KEY}=${sessionId}; Max-Age=1800; path=/; secure`

    if (domain) {
      cookieValue += `; domain=${domain}`
    }

    document.cookie = cookieValue
  }

  function _setSessionId() {
    /**
     * Try to keep same session id if it exists, generate a new one otherwise.
     *   - First request in a session will generate a new session id
     *   - The next request will keep the same session id and extend the TTL for 30 more minutes
     */

    const sessionId = _getSessionId() || _uuidv4()
    if (
      [storageMethods.localStorage, storageMethods.sessionStorage].includes(
        STORAGE_METHOD
      )
    ) {
      const now = new Date()
      const item = {
        value: sessionId,
        expiry: now.getTime() + 1800 * 1000,
      }
      const value = JSON.stringify(item)
      const storage =
        STORAGE_METHOD === storageMethods.localStorage
          ? localStorage
          : sessionStorage
      return STORAGE_METHOD === storage.setItem(STORAGE_KEY, value)
    }

    return _setSessionIdFromCookie(sessionId)
  }

  /**
   * Try to mask PPI and potential sensible attributes
   *
   * @param  { object } payload Event payload
   * @return { object } Sanitized payload
   */
  const _maskSuspiciousAttributes = payload => {
    const attributesToMask = [
      'username',
      'user',
      'user_id',
      'userid',
      'password',
      'pass',
      'pin',
      'passcode',
      'token',
      'api_token',
      'email',
      'address',
      'phone',
      'sex',
      'gender',
      'order',
      'order_id',
      'orderid',
      'payment',
      'credit_card',
    ]

    // Deep copy
    let _payload = JSON.stringify(payload)
    attributesToMask.forEach(attr => {
      _payload = _payload.replaceAll(
        new RegExp(`("${attr}"):(".+?"|\\d+)`, 'mgi'),
        '$1:"********"'
      )
    })

    return _payload
  }

  /**
   * Send event to endpoint
   *
   * @param  { string } name Event name
   * @param  { object } payload Event payload
   * @return { object } request response
   */
  async function _sendEvent(name, payload) {
    _setSessionId()
    let url

    // Use public Tinybird url if no custom endpoint is provided
    if (proxyUrl) {
      // Use the full proxy URL as provided
      url = proxyUrl
    } else if (proxy) {
      // Construct the proxy URL from the proxy domain
      url = `${proxy}/api/tracking`
    } else if (host) {
      host = host.replaceAll(/\/+$/gm, '')
      url = `${host}/v0/events?name=${DATASOURCE}&token=${token}`
    } else {
      url = `https://api.tinybird.co/v0/events?name=${DATASOURCE}&token=${token}`
    }

    let processedPayload
    if (stringifyPayload) {
      processedPayload = _maskSuspiciousAttributes(payload)
      processedPayload = Object.assign({}, JSON.parse(processedPayload), globalAttributes)
      processedPayload = JSON.stringify(processedPayload)
    } else {
      processedPayload = Object.assign({}, payload, globalAttributes)
      const maskedStr = _maskSuspiciousAttributes(processedPayload)
      processedPayload = JSON.parse(maskedStr)
    }

    const session_id = _getSessionId() || _uuidv4()

    const request = new XMLHttpRequest()
    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: name,
        version: '1',
        session_id,
        payload: processedPayload,
      })
    )
  }

  /**
   * Get country and locale from timezone and navigator
   */
  function getCountryAndLocale() {
    let country, locale;
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      country = timezones[timezone];
      locale =
        navigator.languages && navigator.languages.length
          ? navigator.languages[0]
          : navigator.userLanguage ||
            navigator.language ||
            navigator.browserLanguage ||
            'en';
    } catch (error) {
      // ignore error
    }
    return { country, locale };
  }

  /**
   * Track page hit
   */
  function _trackPageHit() {
    // If local development environment
    // if (/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(location.hostname) || location.protocol === 'file:') return;
    // If test environment
    if (window.__nightmare || window.navigator.webdriver || window.Cypress)
      return

    const { country, locale } = getCountryAndLocale();

    // Wait a bit for SPA routers
    setTimeout(() => {
      _sendEvent('page_hit', {
        'user-agent': window.navigator.userAgent,
        locale,
        location: country,
        referrer: document.referrer,
        pathname: window.location.pathname,
        href: window.location.href,
      })
    }, 300)
  }

  if (webVitals) {
    function sendMetric(metric) {
      const { country, locale } = getCountryAndLocale();
      _sendEvent('web_vital', {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        pathname: window.location.pathname,
        href: window.location.href,
        'user-agent': window.navigator.userAgent,
        locale,
        location: country,
        referrer: document.referrer,
      });
    }
    webVitals.onCLS(sendMetric);
    webVitals.onFID(sendMetric);
    webVitals.onFCP(sendMetric);
    webVitals.onLCP(sendMetric);
    if (webVitals.onINP) webVitals.onINP(sendMetric);
    webVitals.onTTFB(sendMetric);
  }

  // Client
  window.Tinybird = { trackEvent: _sendEvent }

  // Event listener
  window.addEventListener('hashchange', _trackPageHit)
  const his = window.history
  if (his.pushState) {
    const originalPushState = his['pushState']
    his.pushState = function () {
      originalPushState.apply(this, arguments)
      _trackPageHit()
    }
    window.addEventListener('popstate', _trackPageHit)
  }

  let lastPage
  function handleVisibilityChange() {
    if (!lastPage && document.visibilityState === 'visible') {
      _trackPageHit()
    }
  }

  if (document.visibilityState === 'prerender') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  } else {
    _trackPageHit()
  }
})()
