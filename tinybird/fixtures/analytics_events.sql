SELECT
    now() - (rand() % (7 * 24 * 60 * 60)) AS timestamp,
    if(rand() % 10 > 0, concat('session_', toString(1 + rand() % 500)), NULL) AS session_id,
    if(rand() % 10 < 7, 'page_hit', 'web_vital') AS action,
    concat('v', toString(1 + rand() % 3), '.', toString(rand() % 10)) AS version,
    
    if(action = 'page_hit',
        /* PAGE HIT PAYLOAD */
        concat('{
            "pathname": "', ['/', '/about', '/pricing', '/docs', '/blog', '/product', '/job-offers', '/customer-stories', '/templates', '/waiting', '/blog-posts', '/api', '/products', '/contact', '/features', '/team', '/privacy', '/terms'][1 + rand() % 18], '",
            "href": "https://', ['example.com', 'demo.site', 'test.org', 'app.example.com', 'dev.test.org'][1 + rand() % 5], ['/', '/about', '/pricing', '/docs', '/blog', '/product', '/job-offers', '/customer-stories', '/templates', '/waiting', '/blog-posts', '/api', '/products', '/contact', '/features', '/team', '/privacy', '/terms'][1 + rand() % 18], '",
            "referrer": "', ['', 'https://google.com', 'https://linkedin.com', 'https://facebook.com', 'https://twitter.com'][rand() % 5], '",
            "userAgent": "', ['Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.51'][rand() % 5], '",
            "locale": "', ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'][rand() % 5], '",
            "location": {
                "country": "', ['United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Canada', 'Australia', 'Japan', 'Brazil', 'India'][rand() % 10], '",
                "city": "', ['New York', 'London', 'Berlin', 'Paris', 'Madrid', 'Toronto', 'Sydney', 'Tokyo', 'Sao Paulo', 'Mumbai'][rand() % 10], '"
            }
        }'),
        
        /* WEB VITAL PAYLOAD */
        (
            WITH 
                ['LCP', 'TTFB', 'FCP', 'INP', 'CLS'][rand() % 5] AS metric_name,
                rand() % 100 AS performance_category
            
            SELECT concat('{
                "name": "', metric_name, '",
                "value": ', 
                    CASE 
                        WHEN performance_category < 80 THEN
                            /* Good performance (80%) */
                            CASE 
                                WHEN metric_name = 'LCP' THEN toString(600 + rand() % 1900)
                                WHEN metric_name = 'TTFB' THEN toString(100 + rand() % 700)
                                WHEN metric_name = 'FCP' THEN toString(400 + rand() % 1600)
                                WHEN metric_name = 'INP' THEN toString(30 + rand() % 270)
                                ELSE toString(round(0.01 + rand() / 7000, 3))  /* CLS */
                            END
                        WHEN performance_category < 95 THEN
                            /* Moderate performance (15%) */
                            CASE 
                                WHEN metric_name = 'LCP' THEN toString(2500 + rand() % 5000)
                                WHEN metric_name = 'TTFB' THEN toString(800 + rand() % 1200)
                                WHEN metric_name = 'FCP' THEN toString(2000 + rand() % 3000)
                                WHEN metric_name = 'INP' THEN toString(300 + rand() % 500)
                                ELSE toString(round(0.15 + rand() / 4000, 3))  /* CLS */
                            END
                        ELSE
                            /* Poor performance (5%) */
                            CASE 
                                WHEN metric_name = 'LCP' THEN toString(7500 + rand() % 7500)
                                WHEN metric_name = 'TTFB' THEN toString(2000 + rand() % 1000)
                                WHEN metric_name = 'FCP' THEN toString(5000 + rand() % 3000)
                                WHEN metric_name = 'INP' THEN toString(800 + rand() % 700)
                                ELSE toString(round(0.3 + rand() / 2000, 3))  /* CLS */
                            END
                    END, ',
                "delta": ', toString(10 + rand() % 90), ',
                "pathname": "', ['/', '/about', '/pricing', '/docs', '/blog', '/product', '/job-offers', '/customer-stories', '/templates', '/waiting', '/blog-posts', '/api', '/products', '/contact', '/features', '/team', '/privacy', '/terms'][1 + rand() % 18], '",
                "domain": "', ['example.com', 'demo.site', 'test.org', 'app.example.com', 'dev.test.org'][1 + rand() % 5], '"
            }')
        )
    ) AS payload
FROM numbers(1000)
