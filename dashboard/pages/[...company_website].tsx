import React, { useEffect, useState } from 'react';
import Script from 'next/script'
import { NextPageContext } from 'next';

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = `hsl(${hash % 360}, 100%, 70%)`; // Using HSL for vibrant colors
  return color;
};

interface LandingPageProps {
  client_id: string;
  token: string;
}

function LandingPage({client_id, token}: LandingPageProps) {
  const companyName = client_id;
  const productText = 'Welcome to our amazing product catalog!';

  const headerColor = stringToColor(companyName);
  const [textColor, setTextColor] = useState('#000'); // Default color
  const params = "client_id=" + client_id + "&token=" + token;

  return (
    <>
      <Script
        defer
        src="https://unpkg.com/@tinybirdco/flock.js"
        data-token={token}
        data-client_id={client_id}
      />

    <div className="bg-body min-h-screen py-5 px-5 sm:px-10 text-sm leading-5 text-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6 sm:space-y-10">
                <div>
                    <header style={{ backgroundColor: headerColor }}>
                    <h1 className="text-6xl">{companyName}</h1>
                  </header>
                    <main style={{ color: textColor }}>
                    <p>{productText}</p>
                    <h2 className="text-4xl">Available Car Parts</h2>
                    <ul>
                        <li><a href={"/company_website/engine.html?" + params}>Engine</a></li>
                        <li><a href={"/company_website/tires.html?" + params}>Tires</a></li>
                        <li><a href={"/company_website/brakes.html?" + params}>Brakes</a></li>
                        <li><a href={"/company_website/exhaust.html?" + params}>Exhaust System</a></li>
                        <li><a href={"/company_website/lights.html?" + params}>Lights</a></li>
                        <li><a href={"/company_website/steering.html?" + params}>Steering System</a></li>
                        <li><a href={"/company_website/suspension.html?" + params}>Suspension</a></li>
                        <li><a href={"/company_website/transmission.html?" + params}>Transmission</a></li>
                        <li><a href={"/company_website/battery.html?" + params}>Battery</a></li>
                    </ul>
                  </main>
                </div>
            </div>
          </div>
    </div>
    </>
  );
}

LandingPage.getInitialProps = ({ query }: NextPageContext) => {
  const client_id = query.client_id || 'anon';
  const token = query.token || '';

  return {client_id, token };
};


export default LandingPage;
