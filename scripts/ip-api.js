// Shodan API key: jY0amc5FUM66mEO58saLl8rMpfAQnNDI
// 129.21.149.131
// https://api.shodan.io/shodan/host/<IP>?key=jY0amc5FUM66mEO58saLl8rMpfAQnNDI

// IPInfo API key: d05819c7776e3a
// https://ipinfo.io/<IP>?token=d05819c7776e3a


// Globals
const APIKey_IPInfo = "d05819c7776e3a";
const APIKey_Shodan = "jY0amc5FUM66mEO58saLl8rMpfAQnNDI";

export async function searchIPInformation(IPAddress) {
    let IPInfoData = getDataIPInfo(IPAddress)
    .then(ipInfoData => parseIPInfoData(ipInfoData))
    .then(htmlComponent => htmlComponent);

    let ShodanData = getDataShodan(IPAddress)
    .then(shodanData => parseShodanData(shodanData))
    .then(htmlComponent => htmlComponent);

    let htmlComponents = Promise.all([IPInfoData, ShodanData])
    .then(data => {return [data[0][0], data[1][0], data[0][1], data[1][1]]}); 

    return htmlComponents;
}


async function getDataIPInfo(IPAddress) {
    // Query the IPInfo api.
    const link_IPInfo = `https://ipinfo.io/${IPAddress}?token=${APIKey_IPInfo}`;
    console.log(link_IPInfo);
    let IPInfoData = await fetchData(link_IPInfo);
    console.log(IPInfoData);
    return IPInfoData;
}

async function getDataShodan(IPAddress) {
    // Query the Shodan api.
    const link_Shodan = `https://api.shodan.io/shodan/host/${IPAddress}?key=${APIKey_Shodan}`;
    console.log(link_Shodan);
    let ShodanData = await fetchData(link_Shodan);
    console.log(ShodanData);
    return ShodanData;
}

// Parse the information from IPInfo API, return an HTML element for data and HTML element for link to the page.
async function parseIPInfoData(IPInfoData) {
    let htmlComponent;
    const linkToPage = `<a href="https://ipinfo.io/${IPInfoData.ip}">IPInfo Page<\a>`;

    // First check if bogon. If so, that's all the info we display.
    if(IPInfoData.bogon == true) {
        htmlComponent = `<p>${IPInfoData.ip} is a bogon address <a href="https://ipinfo.io/bogon">(more infomation)</a></p>`;
        return [htmlComponent, linkToPage];
    }

    htmlComponent = `
    <h3>${IPInfoData.ip}</h3><hr>
    ${IPInfoData.hostname !== undefined ? "<p><strong>Hostname: </strong>" + IPInfoData.hostname + "</p>" : ""}
    ${IPInfoData.org !== undefined ? "<p><strong>Organization: </strong>" + IPInfoData.org + "</p>" : ""}
    <p><strong>Location: </strong>${IPInfoData.city !== undefined ? IPInfoData.city + "," : ""} 
    ${IPInfoData.region !== undefined ? IPInfoData.region + "," : ""}
    ${IPInfoData.postal !== undefined ? IPInfoData.postal + "," : ""}
    ${IPInfoData.country !== undefined ? IPInfoData.country : ""}</p>
    ${IPInfoData.loc !== undefined ? "<p><strong>GPS Coordinates: </strong>" + IPInfoData.loc + 
    " <a href='https://www.google.com/maps/place/" + IPInfoData.loc + "'>(Google Maps)</a></p>" : ""}
    `;

 
    return [htmlComponent, linkToPage];
}

async function parseShodanData(ShodanData) {
    let htmlComponent;

    // Bogon or likely address without server, return nothing (handled by IPInfo)
    if(ShodanData.error == "Invalid IP" || ShodanData.error == "No information available for that IP.") {
        htmlComponent = "<hr>";
        return [htmlComponent, ""];
    }
    // Sort the ports array (not sure why it isn't sorted by default).
    ShodanData.ports.sort((a, b) => a - b);

    htmlComponent = `
    ${ShodanData.ports.length != 0 ? "<p><strong>Open Ports:</strong> [" + ShodanData.ports.join(", ") + "]" : ""}
    <hr>
    `;

    const linkToPage = `<br><a href="https://www.shodan.io/host/${ShodanData.ip_str}">Shodan.io Page<\a>`;
    return [htmlComponent, linkToPage];
}


async function fetchData(link) {
    const json = await fetch(link)
                        .then(response => {
                            if(!response.ok){
                                console.log(`ERROR: ${response.statusText}`);
                            }
                            return response.json();
                        });
    return json;
}