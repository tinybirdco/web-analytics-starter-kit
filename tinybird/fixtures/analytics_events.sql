SELECT
    now() - rand() % (30 * 86400) AS timestamp,
    if(rand() % 10 > 0, concat('sess_', toString(rand() % 1000)), NULL) AS session_id,
    if(rand() % 10 < 7, 'page_hit', 'web_vital') AS action,
    concat('v', toString(1 + rand() % 3), '.', toString(rand() % 10), '.', toString(rand() % 10)) AS version,
    if(
        action = 'page_hit',
        concat('{
            "pathname": "', arrayElement(['/','','/product','/blog','/contact','/pricing','/about','/login','/signup'], 1 + rand() % 8), '",
            "href": "https://', arrayElement(['example.com','demo.site','test.org','app.demo.io','myapp.com'], 1 + rand() % 5), arrayElement(['/','','/product','/blog','/contact','/pricing','/about','/login','/signup'], 1 + rand() % 8), '",
            "referrer": "', arrayElement(['','','','https://google.com','https://facebook.com','https://linkedin.com','https://twitter.com'], 1 + rand() % 7), '",
            "userAgent": "', arrayElement([
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Edge/100.0.1185.44'
            ], 1 + rand() % 5), '",
            "locale": "', arrayElement(['en-US','es-ES','fr-FR','de-DE','it-IT','zh-CN','ja-JP','ko-KR'], 1 + rand() % 8), '",
            "location": {
                "country": "', arrayElement(['United States','Spain','France','Germany','Italy','United Kingdom','Canada','Japan','Australia'], 1 + rand() % 9), '",
                "city": "', arrayElement(['New York','Los Angeles','Madrid','Paris','Berlin','Rome','London','Toronto','Tokyo','Sydney'], 1 + rand() % 10), '"
            }
        }'),
        concat('{
            "name": "', arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5), '",
            "value": ', 
            toString(
                case 
                    when arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5) = 'LCP' then 800 + rand() % 3200 
                    when arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5) = 'TTFB' then 100 + rand() % 1400
                    when arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5) = 'FCP' then 500 + rand() % 2500
                    when arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5) = 'INP' then 50 + rand() % 750
                    when arrayElement(['LCP','TTFB','FCP','INP','CLS'], 1 + rand() % 5) = 'CLS' then round((rand() % 50) / 100.0, 2)
                    else 0
                end
            ), ',
            "delta": ', toString(10 + rand() % 190), ',
            "pathname": "', arrayElement(['/','','/product','/blog','/contact','/pricing','/about','/login','/signup'], 1 + rand() % 8), '",
            "domain": "', arrayElement(['example.com','demo.site','test.org','app.demo.io','myapp.com'], 1 + rand() % 5), '"
        }')
    ) AS payload,
    concat('tenant_', toString(1 + rand() % 20)) AS tenant_id,
    arrayElement(['example.com','demo.site','test.org','app.demo.io','myapp.com'], 1 + rand() % 5) AS domain
FROM numbers(1000)