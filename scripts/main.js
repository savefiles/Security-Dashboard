
//https://observablehq.com/@d3/learn-d3
import define from "./observable-hq/index.js";
import {Runtime, Library, Inspector} from "./observable-hq/runtime.js";

import * as cveAPI from "./cve-api.js";
import * as IPAPI from "./ip-api.js";
import * as vue from "./vue.js"


export function init() {
    vue.init();
    createGraphs();
}

async function createGraphs() {

    // Create the graph, add some blank data.
    let blankDataSkeleton = {
        name: "Monthly CVE graph",
        children: [
            {name: "Applications"},
            {name: "Operating Systems"},
            {name: "Hardware"}
        ]
    };
    const main = new Runtime().module(define, name => {
        if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-ed33c0fb"));
    });
    main.redefine("data", blankDataSkeleton);
    main.redefine("width", window.innerWidth * 0.45);
    main.redefine("margin", { top: 30, right: 30, bottom: 10, left: 100 })

    // Send a post request to server asking for data with timestamp. If data is out of date, query again.
    let myHeaders = new Headers();
    myHeaders.append('Query-Type', 'Fetch');

    // Ask the server for data.
    fetch('https://people.rit.edu/cth4742/330/security-dashboard/query-cve-api.php', {
        method: 'POST',
        headers: myHeaders
    })
    // Parse the results as json.
    .then(response => {
        let json = response.json(); 
        return json;
    })
    // Split between stored data and timestamps, and query for new data from the timestamps.
    .then(json => {
        let timestamps = json[0];
        let fetchedData = json[1].data;

        // Take the stored data, and graph it before we query for the new data from API.
        let combinedData = cveAPI.combineParsedData(fetchedData.map(a => a.data))
        .then(data => {
            main.redefine("data", cveAPI.prepareForGraph(data));
            return data;
        });

        // Check to see if the API actually needs to be queried, as requested by server.
        if(timestamps.timestamps.length == 0) {
            document.querySelector("#loading").textContent = "All done!";
            return;
        }
        document.querySelector("#loading").textContent = "Displaying cached data, fetching newer data...";

        // Query the API with the server requested timestamps.
        const cveSearchPromise = cveAPI.getCVEData(timestamps.timestamps);

        // Once the new CVE data has been downloaded, parse.
        cveSearchPromise.then(async gatheredDataPromises => {
            let gatheredData = [];
            // Convert to real data (instead of promises).
            gatheredDataPromises.forEach(promise => {
                promise.data.then(data => gatheredData.push({date: promise.date, data: data}));
            });

            // Combine the old data with the newly fetched data to graph.
            let cveData = [combinedData];
            gatheredData.forEach(object => {
                cveData.push(object.data);
            });
            let allGraphData = await cveAPI.combineParsedData(cveData);
            
            // Put the new data in the graph.
            document.querySelector("#loading").textContent = "";
            main.redefine("data", cveAPI.prepareForGraph(allGraphData));

            // Send the new data to the server as requested.
            let jsonData = {data: gatheredData};
            let myHeaders = new Headers();
            myHeaders.append('Query-Type', 'Update');

            fetch('https://people.rit.edu/cth4742/330/security-dashboard/query-cve-api.php', {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(jsonData)
            });
        });
    });
}