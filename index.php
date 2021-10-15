<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Security Dashboard</title>

    <!-- Vue and Bootstrap -->
    <!-- Load required Bootstrap and BootstrapVue CSS -->
    <link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap/dist/css/bootstrap.min.css" />
    <link type="text/css" rel="stylesheet" href="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.css" />
    <!-- Load polyfills to support older browsers -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2CIntersectionObserver" crossorigin="anonymous"></script>
    <!-- Load Vue followed by BootstrapVue -->
    <script src="https://unpkg.com/vue@latest/dist/vue.min.js"></script>
    <script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.js"></script>
    <!-- Load the following for BootstrapVueIcons support -->
    <script src="https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue-icons.min.js"></script>
	<!-- d3js -->
	<script src="https://d3js.org/d3.v6.min.js"></script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap" rel="stylesheet"> 

	<!-- My stuff -->
    <script type="module" src="scripts/loader.js"></script>
	<link rel="stylesheet" href="styles/styles.css">
	<link rel="stylesheet" href="styles/observable-hq.css">
	


</head>
<body>
<div id="app">
    <div id="container">
    <div id="content">
        <nav class="myheader">
            <!-- Search bar -->
            <b-input-group id="searchgroup">
                <b-input-group-prepend>
                    <b-dropdown id="searchtype" :text="searchtype">
                        <b-dropdown-item @click="switchSearchType('CVE')">CVE</b-dropdown-item>
                        <b-dropdown-item @click="switchSearchType('IP')">IP address</b-dropdown-item>
                    </b-dropdown>
                </b-input-group-prepend>

                <b-form-input id="searchbar" v-model="searchtext" @change="searchChange" @keyup.enter="search" placeholder="Enter your CVE search term!"></b-form-input>
                <b-tooltip :show.sync="showTooltip" target="searchbar" triggers="manual" placement="bottomright">
                    <p>Invalid IP address entered!</p>
                </b-tooltip>

                <b-button variant="transparent" id="searchbutton" type="submit" tag="img" size="sm" src="images/search-arrow.svg" @click="search">
                </b-button>
            </b-input-group>
        </nav>	

        <!-- Hidden search modal -->
        <b-modal id="searchmodal" ref="searchmodal" size="xl" title="Search Results" :hide-footer="true" scrollable>
            <template #default>
                <div v-html="modalData"></div>
            </template>
        </b-modal>
        
        <!-- Graph -->
        <div class="container" id="graph-cve-monthly">
            <h2 id="graph-header">CVE's released this month:</h2>
            <div class="size-container">
                <p id="loading">Fetching data from caching server...</p>
                <div id="observablehq-chart-ed33c0fb"></div>
            </div>
            <div class="footnote">
                <p>Click on the bars to see more details, and click anywhere else to go back up.</p>
                <p>Credit: <a href="https://observablehq.com/@d3/hierarchical-bar-chart">Hierarchical Bar Chart by D3</a></p>
            </div>
        </div>
    </div>
    </div>
    <footer>
    <b-button id="reset-button" variant="danger" @click="reset">Reset All</b-button>
    <p>Website made by Chris Hambacher, 2021</p>
    </footer>   
    
</div> <!-- end #app -->

<!-- hidden field to get the user's IP address -->
<p id="ipAddress" style="display:none">        
<?php 
	# Get the client IP address, and write to visitors list.
    error_reporting(0);
    ini_set('display_errors', 0);

    $handle = fopen("visitors.csv", "a");
    if(!$handle) {
        echo "Could not open the file.";
    }
    else {
        # Get the client IP address.
        $client = $_SERVER['HTTP_CLIENT_IP'];
        $forward = $_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote = $_SERVER['REMOTE_ADDR'];

        if(filter_var($client, FILTER_VALIDATE_IP)) {
            $ip = $client;
        }
        elseif(filter_var($forward, FILTER_VALIDATE_IP)) {
            $ip = $forward;
        }
        else {
            $ip = $remote;
        }

		echo $ip;

        # Set the time zone to EST.
        date_default_timezone_set("America/New_York");
        $time = date("d/m/Y H:i:s") . " EST";

        # Write to file.
        fwrite($handle, $ip . ", " . $time . PHP_EOL);
        fclose($handle);
    }
?>
</p>

</body>
</html>