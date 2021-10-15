import * as IPApi from "./ip-api.js"
import {searchCVEDatabase} from "./cve-api.js"

export function init() {
    const app = new Vue({
        el: '#app',
        data: {
            searchtype: localStorage.getItem("searchtype") === null ? "CVE" : localStorage.getItem("searchtype"),
            searchtext: localStorage.getItem("searchtext") === null ? "" : localStorage.getItem("searchtext"),
            searchoffset: 0,
            modalData: "<p>Temp</p>",
            showTooltip: false,
            showModal: false
        },
        methods:{
            // Switch between the two search methods using the dropdown.
            switchSearchType(searchType) {
                if(searchType == "IP") {
                    let IPAddress = document.querySelector("#ipAddress").innerHTML.trim();
                    document.querySelector('#searchbar').placeholder = `Your IP address is ${IPAddress}`;
                    this.searchtype = "IP";
                    localStorage.setItem("searchtype", this.searchtype);
                }
                else if(searchType == "CVE") {
                    document.querySelector('#searchbar').placeholder = "Enter your CVE search term!";
                    this.searchtype = "CVE";
                    localStorage.setItem("searchtype", this.searchtype);
                }
            },
            // User inputted new text.
            searchChange() {
                localStorage.setItem("searchtext", this.searchtext);
            },
            // Search when the user presses enter.
            search() {
                if(this.searchtype == "IP") {
                    // Check if it's a valid IP address.
                    let regexIP = /^(?:\d{1,3}\.){3}\d{1,3}$/;
                    let regexNum = /\d{1,3}/g;
                    let isProperIP = (this.searchtext.match(regexIP) != null);
                    let nums = [...this.searchtext.matchAll(regexNum)];
                    for(let i = 0; i < 4; i++) isProperIP = isProperIP && (nums[i] <= 255);
                    
                    if(isProperIP) {
                        // Show modal and loading text.
                        let modal = this.$refs['searchmodal']; 
                        this.modalData = "Loading results...";
                        modal.show();

                        // Promise
                        let promise = IPApi.searchIPInformation(this.searchtext);
                        promise.then(htmlComponents => {
                            // Edit the data to be displayed in the modal.
                            this.modalData = "";
                            htmlComponents.forEach(component => {           // For each html string, insert to the end of modal.
                                this.modalData += component;
                            });
                        });     
                    }
                    else {
                        // Create and immediately call the async function (https://usefulangle.com/post/248/javascript-async-anonymous-function-iife)
                        // Show error message tooltip.
                        (async () => {
                            this.showTooltip = true;
                            await new Promise(r => setTimeout(r, 4000));
                            this.showTooltip = false;
                        })(); 
                    }
                }
                if(this.searchtype == "CVE") {
                    // Show modal and loading text.
                    let modal = this.$refs['searchmodal']; 
                    this.modalData = "Loading results...";
                    modal.show();  

                    let promise = searchCVEDatabase(this.searchtext, this.searchoffset);
                    promise.then(htmlComponents => {
                        // Edit the data to be displayed in the modal.
                        this.modalData = htmlComponents;
                        return;
                    });     
                }
            },
            reset() {
                // Clear local storage.
                localStorage.clear();
                this.switchSearchType("CVE");
                this.searchtext = "";
            },
        } // end methods
    }); // end App
}
